import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, InputToolbar, Send } from 'react-native-gifted-chat';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
const ChatBotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState(0);
  const [showIssueOptions, setShowIssueOptions] = useState(false);
  const [complaintData, setComplaintData] = useState({
    name: '',
    contact: '',
    issueType: '',
    description: '',
    location: '',
    userId: '',
  });

  const sendBotMessage = (text) => {
    const msg = {
      _id: Math.random().toString(),
      text,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'Bot',
      },
    };
    setMessages((prev) => GiftedChat.append(prev, [msg]));
  };

  const askNextQuestion = async (newData = {}) => {
    const updatedData = { ...complaintData, ...newData };
    setComplaintData(updatedData);

    switch (step) {
      case 0:
        sendBotMessage('Hi! What is your name?');
        setStep(1);
        break;
      case 1:
        sendBotMessage('Please enter your contact number.');
        setStep(2);
        break;
      case 2:
        sendBotMessage('Please select your issue type:');
        setShowIssueOptions(true);
        setStep(3);
        break;
      case 4: // Only if "Other" is selected
        sendBotMessage('Please type your issue type.');
        break;
      case 5:
        sendBotMessage('Please describe your issue in detail.');
        setStep(6);
        break;
      case 6:
        sendBotMessage('Please enter the location of the complaint.');
        setStep(7);
        break;
      case 7:
        const userId = await AsyncStorage.getItem('userId');
        sendBotMessage('Submitting your complaint...');
        submitComplaint({ ...updatedData, userId });
        setStep(8);
        break;
      default:
        sendBotMessage('Your complaint has been submitted. Thank you!');
    }
  };

  const onSend = useCallback((newMessages = []) => {
    const userMessage = newMessages[0].text;
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    if (step === 1) askNextQuestion({ name: userMessage });
    else if (step === 2) askNextQuestion({ contact: userMessage });
    else if (step === 4) askNextQuestion({ issueType: userMessage, step: 5 }); // other typed issue
    else if (step === 6) askNextQuestion({ description: userMessage });
    else if (step === 7) askNextQuestion({ location: userMessage });
  }, [step, complaintData]);

  const submitComplaint = async (data) => {
    try {
      await axios.post('http://<your-backend-url>/api/complaints', data);
      sendBotMessage('✅ Complaint submitted successfully!');
    } catch (error) {
      sendBotMessage('❌ Failed to submit the complaint. Try again later.');
    }
  };

  const handleIssueSelection = (type) => {
    setShowIssueOptions(false);
    if (type === 'Other') {
      setStep(4); // Ask for typing custom issue
    } else {
      askNextQuestion({ issueType: type }); // Next: Ask for description
      setStep(5);
    }
  };

  useEffect(() => {
    askNextQuestion();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: 1 }}
        renderInputToolbar={(props) =>
          showIssueOptions ? null : <InputToolbar {...props} />
        }
        renderSend={(props) =>
          showIssueOptions ? null : <Send {...props} />
        }
      />
      {showIssueOptions && (
        <View style={styles.optionsContainer}>
          {['Water', 'Electricity', 'Road', 'Garbage', 'Other'].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.optionButton}
              onPress={() => handleIssueSelection(item)}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default ChatBotScreen;


const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
  },
  optionButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 8,
    margin: 5,
  },
  optionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const ChatBotScreen = () => {
//   return (
//     <View style={styles.container}>
//       <Text>🤖 This is the chatbot screen!</Text>
//     </View>
//   );
// };

// export default ChatBotScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
// });
