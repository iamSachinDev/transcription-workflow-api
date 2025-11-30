import { config } from '../../config/env';
import { logger } from '../../lib/logger';
import { downloadWithRetry, transcribeMock } from '../transcriptions/transcription.service';

export const transcribeAudio = async (audioUrl: string, language = 'en-US'): Promise<{ text: string; source: string }> => {
    const audio = await downloadWithRetry(audioUrl)

    if (!config.azureSpeechKey || !config.azureRegion) {
        logger.info({ language }, 'Azure keys missing; using mock')
        const text = await transcribeMock(audio)
        return { text, source: 'azure-mock' }
    }

    // Stub for real Azure SDK implementation
    // const speechConfig = sdk.SpeechConfig.fromSubscription(config.azureSpeechKey, config.azureRegion)
    // speechConfig.speechRecognitionLanguage = language
    // ... implementation ...

    logger.info({ language }, 'Simulating Azure transcription')
    const text = await transcribeMock(audio)
    return { text, source: 'azure' }
}
