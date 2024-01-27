import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';


import { downloadFile, getFile, getFiles, uploadFile } from './s3';

const app = express();

app.set('port', process.env.PORT || 3002);
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.disable('x-powered-by');

// middlewares
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3002'
}));
app.use(fileUpload({
    tempFileDir: './src/tempUploads',
    useTempFiles: true,
    limits: { fileSize: 150 * 1024 * 1024 }
}));
app.use(express.static(path.join(__dirname, 'public'), { 'extensions': ['ejs', 'css', 'js'] }));

// routes
app.get('/', async (req, res) => {
    res.render('index');
});

app.get('/files/:fileName', async (req, res) => {
    try {
        if (!req.params.fileName) {
            return res.status(400).json({ message: 'Missing file name' });
        }
        const file = await getFile(req.params.fileName);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.render('filePage', { fileName: req.params.fileName, fileMetadata: file.$metadata });
    } catch (error) {
        console.error('Error fetching or rendering file page:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.post('/uploads/files', async (req, res) => {
    try {
        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        const uploadedFileName = req.files.file.name;
        const existingFile = await getFile(uploadedFileName);
        if (existingFile) {
            return res.status(409).json({ message: 'File with the same name already exists!' });
        }
        await uploadFile(req.files.file);
        res.redirect(`/files/${uploadedFileName}`);
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('/downloads/files/:fileName', async (req, res) => {
    try {
        if (!req.params.fileName) {
            return res.status(400).json({ message: 'Missing file name' });
        }

        const fileStream = await downloadFile(req.params.fileName);

        res.setHeader('Content-Disposition', `attachment; filename=${req.params.fileName}`);
        res.setHeader('Content-Type', 'application/octet-stream');

        fileStream.pipe(res);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

app.get('*', async (req, res) => {
    res.send('404');
})

// server listen
app.listen(
    app.get('port'),
    () => console.log("[💘] Server started on", app.get('port'))
)