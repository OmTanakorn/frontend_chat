import React, { useEffect, useState } from "react"
import { Button, Input } from 'antd'
// const { Configuration, OpenAIApi } = require("openai")

const { TextArea } = Input
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const mic = new SpeechRecognition()
const msg = new SpeechSynthesisUtterance()

mic.continuous = true
mic.interimResults = true
mic.lang = 'th-TH'

msg.lang = 'th-TH'

// const configuration = new Configuration({
//     apiKey: "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",
// })
// const openai = new OpenAIApi(configuration)


const Main = () => {
    const [isListening, setIsListening] = useState(false)
    const [note, setNote] = useState('')
    const [message, setMessage] = useState('')
    const [micStatus,setMicStatus] = useState(true)
    const [voice, setVoice] = useState(null)
    const [speechSynthesisInstance, setSpeechSynthesisInstance] = useState(null)
    
    const speak = (voice) => {
        const voices = speechSynthesisInstance.getVoices()
        if (voices.length > 0) {
          setVoice(voices[0])
        }
        msg.voice = voice
        speechSynthesisInstance.speak(msg)
        console.log("msg ==> ", msg)
    }

    useEffect(() => {
        setSpeechSynthesisInstance(window.speechSynthesis)

        mic.onstart = () => {
            console.log('Speech recognition started')
        }

        mic.onresult = async event => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('')
            setMessage(transcript)
            
            const question = transcript
            if (question.trim() !== '' && micStatus === false) {
                try {
                    const response = await fetch('http://localhost:5000', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ question }),
                    });
                    console.log(note)
  
                    if (response.ok) {
                        const responseData = await response.json()
                        setNote(responseData.result.bot)
                        speak(responseData.result.bot)
                        // console.log("setNote เสร็จแล้ว :")

                        
                    } else {
                        console.error('Error sending message to server');
                    }
                } catch (error) {
                    console.error('Error sending message:', error);
                }
            }
            

            // const transcript = Array.from(e.results)
            //     .map(result => result[0])
            //     .map(result => result.transcript)
            //     .join('')
            // setText(transcript)

            // setText(e.target.value)
            // const question = transcript
            // const response = await openai.createCompletion({
            //     model: "text-davinci-003",
            //     prompt: `q: ${question}\n a: `,
            //     temperature: 0,
            //     max_tokens: 100,
            //     top_p: 1,
            //     frequency_penalty: 0.0,
            //     presence_penalty: 0.0,
            //     stop: ["\n"],
            // })

            // setNote(response)
            // console.log(response)

        }
        // console.log(note)

        mic.onerror = event => {
            console.error('Speech recognition error:', event.error)
        }

    }, [micStatus])
    
    const startListening = () => {
        setIsListening(true)
        mic.start()
        setMicStatus(true)
    }

    const stopListening = () => {
        setIsListening(false)
        mic.stop()
        setMicStatus(false)
    }

    return (
        <>
            <br /><br />
            <Button onClick={startListening} disabled={isListening}>
                Start Listening
            </Button>
            <Button onClick={stopListening} disabled={!isListening}>
                Stop Listening
            </Button>
            <br /><br />
            <Input type="text" id="inputText" placeholder="Questions" value={message} />
            <br /><br />
            <TextArea id="outputText" placeholder="Answers" value={note} />
            <br /><br />
        </>
    )
}

export default Main
