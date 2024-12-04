import { Injectable } from '@angular/core';

// Assicurati di importare ipcRenderer
declare var window: any; // Aggiungi questa dichiarazione per accedere a window.electron
const { ipcRenderer } = window.require('electron'); // Usa window.require per ottenere ipcRenderer

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  isElectron: boolean;

  constructor() {
    // Verifica se siamo in ambiente Electron
    this.isElectron = !!(window && window.process && window.process.type);
  }

  // Funzione per inviare una notifica
  sendNotification(body: { title: string; message: string; callback?: () => void }): Promise<void> {
    if (this.isElectron) {
      // Invia la richiesta al processo principale per visualizzare la notifica
      ipcRenderer.invoke('show-notification', {
        title: body.title,
        message: body.message,
        callbackEvent: 'notification-clicked-answer',
      });

      // Restituisci una promessa che verrà risolta quando la notifica viene cliccata
      return new Promise((resolve) => {
        ipcRenderer.once('notification-clicked', () => {
          resolve(); // Risolvi quando l'utente clicca sulla notifica
        });
      });
    } else {
      return Promise.reject('Not running in Electron environment');
    }
  }
}
