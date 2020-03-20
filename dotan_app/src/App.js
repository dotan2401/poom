import React, { useReducer, useState, useRef } from 'react';
import * as mobilenet from '@tensorflow-models/mobilenet';
import './App.css';

const stateMachine = {
  initial: 'initial',
  states: {
    initial: { on: { next: 'loadingModel'}  },
    loadingModel: { on: { next: 'awatingUpload'} },
    awatingUpload: { on: { next: 'ready'} },
    ready: { on: { next: 'classifying'}, showImage: true},
    classifying: { on: { next: 'complete'} },
    complete: { on: {next: 'awatingUpload'}, showImage: true , showResult: true}
  }
  
}

const reducer = (currentState, event) => stateMachine.states[currentState].on[event] || stateMachine.initial; 

const formatResult = ({ className, probability}) => (
  <li key={className}>
   {className}:%{(probability * 100).toFixed()}
  </li>
);




function StartApp() {
const [state, dispatch] = useReducer(reducer, stateMachine.initial);
const[model, setModel] = useState(null);
const inputRef = useRef();
const [imageUrl, setImageUrl] = useState(null)
const imageRef = useRef()
const [result, setResult] = useState(null);

const next = () => dispatch('next')

const loadModel = async () => {
  next();
  const mobilenetModel = await mobilenet.load();
  setModel(mobilenetModel);
  next();
}

const handleUpload = e => {
 const{ files } = e.target;
 if(files.length > 0){
   const url = URL.createObjectURL(files[0]);
   setImageUrl(url);
   next();
 }
}

const identify = async () => {
  next();
  const calssifcationResult = await model.classify(imageRef.current);
  console.log(calssifcationResult)
  setResult(calssifcationResult)
  next();
}

const reset = () => {
  setResult([]);
  setImageUrl(null);
  next();
}

const buttonProps = {
  initial: { text: 'Load Model' , action: loadModel},
  loadingModel: { text: 'Loading Model...', action: () => {}},
  awatingUpload: {  text: 'Uploading Photo', action: () => inputRef.current.click()},
  ready:  {  text: 'Identify', action: identify},
  classifying: {  text: 'Identifying', action: () => {}},
  complete: { text: 'Reset', action: reset}
}


const {showImage = false, showResult = false} = stateMachine.states[state];

  return (
    <div>
      {showImage && <img alt="upload-preview" src={imageUrl} ref={imageRef}/>}
      {showResult&& <ul>
        {result.map(formatResult)}
      </ul>}
      <input type="file" accept="image/*" capture="camera" ref={inputRef} onChange={handleUpload} />
      <button onClick={buttonProps[state].action}> {buttonProps[state].text} </button>
    </div>
  );
}

export default StartApp;
