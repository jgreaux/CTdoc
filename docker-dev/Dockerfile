# Utilise l'image officielle de Deno
FROM denoland/deno:latest

RUN mkdir /data
# Définir le dossier de travail dans le container
WORKDIR /app

# Autoriser les permissions nécessaires à l'exécution
# Ici, on n'inclut pas de fichiers dans l'image, car tu veux exécuter du code externe
CMD ["deno", "task", "start"]
