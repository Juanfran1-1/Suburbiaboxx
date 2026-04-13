export async function compressAvatarImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const img = new Image();

            img.onload = () => {
                const maxWidth = 600;
                const scale = Math.min(1, maxWidth / img.width);

                const canvas = document.createElement('canvas');
                canvas.width = Math.round(img.width * scale);
                canvas.height = Math.round(img.height * scale);

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('NO SE PUDO PROCESAR LA IMAGEN'));
                    return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('NO SE PUDO COMPRIMIR LA IMAGEN'));
                            return;
                        }

                        const compressedFile = new File(
                            [blob],
                            'avatar.jpg',
                            { type: 'image/jpeg' }
                        );

                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    0.75
                );
            };

            img.onerror = () => reject(new Error('IMAGEN INVÁLIDA'));
            img.src = reader.result;
        };

        reader.onerror = () => reject(new Error('NO SE PUDO LEER EL ARCHIVO'));
        reader.readAsDataURL(file);
    });
}