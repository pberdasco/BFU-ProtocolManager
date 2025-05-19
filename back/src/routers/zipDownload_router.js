import { Router } from 'express';
import ZipDownloadController from '../controllers/zipDownload_controller.js';

export const zipDownloadRouter = Router();

zipDownloadRouter.post('/', ZipDownloadController.downloadZip);
