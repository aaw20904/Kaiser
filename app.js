const fs = require('fs');
const wavDecoder = require('wav-decoder');
const wavEncoder = require('wav-encoder');

let coefs= [ 3.13e-04,5.07e-04,7.649e-04,1.097e-03,1.512e-03,2.019e-03,2.628e-03,3.344e-03,4.173e-03,5.119e-03,
        6.183e-03,7.365e-03,8.66e-03,1.006e-02,1.156e-02,1.315e-02,1.481e-02,1.652e-02,1.827e-02,2.004e-02,
        2.18e-02,2.352e-02,2.519e-02,2.678e-02,2.827e-02,2.963e-02,3.084e-02,3.188e-02,3.273e-02,3.338e-02,
        3.382e-02,3.405e-02,3.405e-02,3.382e-02,3.338e-02,3.273e-02,3.188e-02,3.084e-02,2.963e-02,2.827e-02,
        2.678e-02,2.519e-02,2.352e-02,2.18e-02,2.004e-02,1.827e-02,1.652e-02,1.481e-02,1.315e-02,1.156e-02,
        1.006e-02,8.66e-03,7.365e-03,6.183e-03,5.119e-03,4.173e-03,3.344e-03,2.628e-03,2.019e-03,1.512e-03,
        1.097e-03,7.649e-04,5.07e-04,3.13e-04
];

 
/*
      coefs =   coefs.map((val,idx)=>Math.round(val*1048590)); // 1048560 >> 3 = 65535
let another = Array.from(coefs)

 
let content='['
let sum=0;
another.forEach((v,idx)=>{
    content +=`${v},`
     sum += v
    })
    console.log(sum)
content += '], shitf right on 3 bits to have 65535 in sum';
fs.writeFileSync('./Koefs.txt',content);
*/

let inputSamples=[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,]
let outputSamples=[];
  

// Function to read WAV file, extract info, and save raw data to another file
async function processWavFile(inputFilePath, outputFilePath) {
    // Step 1: Read the file buffer
    const buffer = fs.readFileSync(inputFilePath);

    // Step 2: Decode the WAV file
    const audioData = await wavDecoder.decode(buffer);
    
    // Display WAV file information
    const sampleRate = audioData.sampleRate;
    const numberOfChannels = audioData.channelData.length;
    const numberOfSamples = audioData.channelData[0].length;
    const bitDepth = buffer.readUInt16LE(34); // Bit depth at offset 34
    const duration = numberOfSamples / sampleRate;

    console.log('WAV File Information:');
    console.log(`Sample Rate: ${sampleRate} Hz`);
    console.log(`Number of Channels: ${numberOfChannels}`);
    console.log(`Bit Depth: ${bitDepth} bits`);
    console.log(`Number of Samples: ${numberOfSamples}`);
    console.log(`Duration: ${duration.toFixed(2)} seconds`);

    // Optionally modify audio data here (e.g., apply filters, transformations)
    //--------DSP BEGIN
     //DSP1) Extract data for each channel
    const leftChannelData = audioData.channelData[0]; // Left channel
    const rightChannelData = audioData.channelData[1]; // Right channel (if stereo)
    //DSP2) Convert float PCM values [-1, 1] to integer PCM values [-32768, 32767] (16-bit audio)
    let leftChannelIntegers = leftChannelData.map(sample => Math.round(sample * 32767));
    let rightChannelIntegers = rightChannelData.map(sample => Math.round(sample * 32767));
    ///-----process data here......
    leftChannelIntegers=leftChannelIntegers.map(element => {
        return element / 8;
     });
    ///saving:....
     // DSP3): Convert integers back to float PCM values for re-encoding
    const leftChannelProcessed = leftChannelIntegers.map(sample => sample / 32767);
    const rightChannelProcessed = rightChannelIntegers.map(sample => sample / 32767);
    //------------------DSP END
    // Step 3: Encode the audio data back into a WAV file
    const encodedData = await wavEncoder.encode({
        sampleRate: audioData.sampleRate,
        channelData: [leftChannelProcessed, rightChannelProcessed], // Stereo channels
    });

    // Step 4: Write the encoded audio data to the output file
    fs.writeFileSync(outputFilePath, Buffer.from(encodedData));
    console.log(`WAV file saved as: ${outputFilePath}`);
}

function FirFilter (inpData,outData){
  let accum=new Array(64).fill(0);

    let coeficients= [ 328,532,802,1150,1585,2117,2756,3506,4376,
        5368,6483,7723,9081,10549,12122,13789,15530,17323,19158,
        21014,22859,24663,26414,28081,29644,31070,32339,33429,
        34320,35002,35463,35704,35704,35463,35002,34320,33429,
        32339,31070,29644,28081,26414,24663,22859,21014,19158,
        17323,15530,13789,12122,10549,9081,
        7723,6483,5368,4376,3506,2756,2117,1585,1150,802,532,328 ];


  const calcOneWindow = (inpSamples,  start,   coefs)=>{
    let result = 0|0;
        for ( let idx =0; idx < 64; idx++) {
     
             result += coefs[idx] * inpSamples[start + idx] 
             
        }
    
        return result;
  }

      for(l=0;l < inpData.length-64; l++){
        let result = calcOneWindow(inpData, l, coeficients);
        outData.push(result)
    }

  
}

async function main(){
    await processWavFile('./1.wav','./2.wav');
}

main();