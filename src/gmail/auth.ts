import fs from 'fs';
import path from 'path';
import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import config from '../config';
import logger from '../logger';

export async function getAuthClient(): Promise<OAuth2Client> {
  try {
    const tokenPath = config.gmail.tokenPath;
    
    if (fs.existsSync(tokenPath)) {
      const content = fs.readFileSync(tokenPath, 'utf8');
      const credentials = JSON.parse(content);
      
      const client = new google.auth.OAuth2(
        credentials.client_id,
        credentials.client_secret,
        credentials.redirect_uri
      );
      
      client.setCredentials(credentials.tokens);
      logger.info('Using existing Gmail API credentials');
      return client;
    } else {
      logger.info('No existing Gmail credentials found, starting OAuth flow');
      const client = await authenticate({
        scopes: config.gmail.scopes,
        keyfilePath: config.gmail.credentialsPath,
      });
      
      const tokenDir = path.dirname(tokenPath);
      if (!fs.existsSync(tokenDir)) {
        fs.mkdirSync(tokenDir, { recursive: true });
      }
      
      const credentials = {
        client_id: (client as any)._clientId,
        client_secret: (client as any)._clientSecret,
        redirect_uri: (client as any)._redirectUri,
        tokens: client.credentials,
      };
      
      fs.writeFileSync(tokenPath, JSON.stringify(credentials, null, 2));
      logger.info('Gmail API credentials saved to token file');
      
      return client;
    }
  } catch (error) {
    logger.error('Error authenticating with Gmail API:', error);
    throw new Error('Failed to authenticate with Gmail API');
  }
}
