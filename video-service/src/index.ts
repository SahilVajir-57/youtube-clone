import express from 'express';
import{
    uploadProcessedVideo,
    downloadRawVideo,
    deleteRawVideo,
    deleteProcessedVideo,
    convertVideo,
    setupDirectories,
} from './storage';
import { isVideoNew, setVideo } from './firestore';

setupDirectories();

const app = express();

app.use(express.json());

app.post('/process-video', async (req, res) => {

    let data;
    try{
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf8');
        data = JSON.parse(message);
        if (!data.name){
            throw new Error('No name provided');
        }
    } catch(error){
        console.error(error);
        return res.status(400).send('Bad Request');
        
    }

    const inputFileName = data.name;
    const outputFileName = 'processed-${inputFileName}';
    const videoId = inputFileName.split('.')[0];

    if(!isVideoNew(videoId)){
        return res.status(400).send("Video already processed.")
    }else{
        await setVideo(videoId, {id: videoId, uid: videoId.split('-')[0], status: 'processing'});
    }

    await downloadRawVideo(inputFileName);

    try{
        await convertVideo(inputFileName, outputFileName);
    }catch(error){
        await Promise.all([
            deleteRawVideo(inputFileName),
            deleteProcessedVideo(outputFileName),
        ]);
        return res.status(500).send('Internal Server Error');
    }
    await uploadProcessedVideo(outputFileName);

    await setVideo(videoId, { filename: outputFileName, status: 'processed'});

    await Promise.all([
        deleteRawVideo(inputFileName),
        deleteProcessedVideo(outputFileName),
    ]);
    return res.status(200).send('OK');
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Server running on port ${port}');
});

   

