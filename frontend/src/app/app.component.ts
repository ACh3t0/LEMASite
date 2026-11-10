import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FirebaseError } from 'firebase/app';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.config';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
  export class AppComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);
  enviando = false;
  estadoContacto = '';

  volverArriba(): void {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  }

  cerrarMenuProductos(menu: HTMLDetailsElement): void {
    menu.open = false;
  }

  async enviarContacto(event: Event) {
    event.preventDefault();

    const formulario = event.target as HTMLFormElement;
    if (this.enviando || !formulario.reportValidity()) return;

    const datos = new FormData(formulario);
    const campo = (nombre: string) =>
      String(datos.get(nombre) ?? '').trim();

    this.enviando = true;
    this.estadoContacto = 'Enviando…';

    try {
      const contacto = {
        nombre: campo('nombre'),
        apellidos: campo('apellidos'),
        correo: campo('correo'),
        telefono: campo('telefono'),
        giro: campo('giro'),
        mensaje: campo('mensaje'),
        fechaCreacion: serverTimestamp(),
      };

      const contactoRef = doc(collection(db, 'contactos'));
      const mailRef = doc(db, 'mail', contactoRef.id);
      const batch = writeBatch(db);

      batch.set(contactoRef, contacto);
      batch.set(mailRef, {
        // Sustituye esta dirección por el correo real de Yuli.
        to: ['yulianarb@gmail.com'],
        replyTo: contacto.correo,
        message: {
          subject: 'Nuevo cliente',
          text: `Favor de contactar a: ${contacto.nombre} ${contacto.apellidos} medios disponibles:

Teléfono: ${contacto.telefono}
Correo: ${contacto.correo}
Giro: ${contacto.giro}

Mensaje del cliente:
${contacto.mensaje}`,
        },
      });

      const confirmacionRef = doc(
        db,
        'mail',
        `${contactoRef.id}-confirmacion`
      );

      batch.set(confirmacionRef, {
       to: [contacto.correo],
       replyTo: 'yulianarb@gmail.com',
       message: {
         subject: 'Recibimos tu mensaje | LEMA',
         text: `Hola ${contacto.nombre},

      Gracias por contactar a LEMA. Recibimos tu mensaje y pronto nos pondremos en contacto contigo.

      Saludos,
      Equipo LEMA`,
       },
      });

      await batch.commit();

      this.estadoContacto = 'Enviado. Tu mensaje se recibió correctamente.';
      formulario.reset();
    } catch (error) {
      console.error('Error al guardar el contacto:', error);
      const codigo = error instanceof FirebaseError ? error.code : '';
      if (codigo === 'permission-denied') {
        this.estadoContacto =
          'Firestore rechazó el envío por permisos. Revisa las reglas de contactos y mail (permission-denied).';
      } else if (codigo === 'unavailable') {
        this.estadoContacto =
          'No se pudo conectar con Firebase. Revisa tu conexión e inténtalo nuevamente.';
      } else {
        this.estadoContacto =
          `No se pudo guardar el mensaje${codigo ? ` (${codigo})` : ''}. Inténtalo nuevamente.`;
      }
    } finally {
      this.enviando = false;
      this.changeDetector.markForCheck();
    }
  }
}

