import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [file, setFile] = useState(null);
  const [inputText, setInputText] = useState('');
  const inputRef = useRef(null);  // Create a ref for the text input
  const fileInputRef = useRef(null); // Create a ref for the file input

  useEffect(() => {
    // Automatically focus the text input when the component mounts
    inputRef.current.focus();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleTextInputChange = (e) => {
    setInputText(e.target.value);
  };

  const getPresignedUrl = async () => {
    try {
      const endpointUrl = process.env.REACT_APP_API_URL;
      console.log('APIEndpoint-PresignedURL:', endpointUrl);
      const response = await axios({
        method: 'POST',
        url: endpointUrl,
        headers: {
          'Content-Type': 'text/plain',
        },
        data: {
          fileName: file.name,
          contentType: file.type,
        },
      });
      return response.data.preSignedUrl;
    } catch (error) {
      console.error('Error getting presigned URL', error);
      throw error;
    }
  };

  const uploadFileToS3 = async (preSignedUrl) => {
    const result = await axios.put(preSignedUrl, file, {
      headers: {
        'Content-Type': file.type,
      },
    });
    if (result.status === 200) {
      alert('File upload successful');
      const endpointUrl1 = process.env.REACT_APP_DYNAMODB_URL;
      console.log('DYNAMODB_URL:', endpointUrl1);
      alert('Input File saved in dynamoDB.');
      const response = await axios({
        method: 'POST',
        url: endpointUrl1,
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          inputText: inputText,
          inputFilePath: `${process.env.REACT_APP_S3_BUCKET_NAME}/${file.name}`
        },
      });
      console.log('Data saved in DynamoDB:', response.data);
      clearInputs();
    } else {
      throw new Error('File not uploaded successfully');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !inputText) {
      alert('Please select a file and enter some text to upload');
      return;
    }
    try {
      const preSignedUrl = await getPresignedUrl();
      await uploadFileToS3(preSignedUrl);
    } catch (error) {
      console.error('Error during file upload', error);
    }
  };

  const clearInputs = () => {
    setFile(null);
    setInputText('');
    // Explicitly clear the file input and text input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="App">
      <h1>Upload File and Text to S3</h1>
      <input
        type="text"
        placeholder="Enter some text"
        value={inputText}
        onChange={handleTextInputChange}
        ref={inputRef}
      />
      <input
        type="file"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <button onClick={handleSubmit}>Upload</button>
    </div>
  );
};

export default App;
