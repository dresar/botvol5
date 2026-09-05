/**
 * anime.js - Anime feature handler for WhatsApp Bot
 */

class AnimeFeatures {
    constructor(apiManager) {
        this.apiManager = apiManager;
    }

    // Command handler for anime features
    async handleCommand(command, args, msg) {
        switch (command) {
            case 'randomloli':
                return await this.getRandomLoli();
            case 'randomselfie':
                return await this.getRandomSelfie();
            case 'randomwaifu':
                return await this.getRandomWaifu();
            case 'animesticker':
                return await this.getAnimeSticker(args[0] || 'random');
            case 'animestickerpack':
                return await this.getAnimeStickerPack();
            case 'animetextsticker':
                if (args.length === 0) {
                    return '❌ Masukkan teks untuk stiker\n💡 Contoh: /animetextsticker Kawaii';
                }
                return await this.createAnimeTextSticker(args.join(' '), args[args.length - 1]);
            case 'topanime':
                return await this.getTopAnime();
            case 'otakudesu':
                if (args.length === 0) {
                    return '❌ Masukkan judul anime\n💡 Contoh: /otakudesu Naruto';
                }
                return await this.searchAnime(args.join(' '));
            default:
                return '❌ Perintah anime tidak dikenali';
        }
    }

    // Get random loli image
    async getRandomLoli() {
        try {
            const result = await this.apiManager.getRandomLoli();
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return {
                url: null,
                message: '❌ Gagal mendapatkan gambar loli. Coba lagi nanti.'
            };
        }
    }

    // Get random anime selfie
    async getRandomSelfie() {
        try {
            const result = await this.apiManager.getRandomSelfie();
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return {
                url: null,
                message: '❌ Gagal mendapatkan selfie anime. Coba lagi nanti.'
            };
        }
    }

    // Get random waifu image
    async getRandomWaifu() {
        try {
            const result = await this.apiManager.getRandomWaifu();
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return {
                url: null,
                message: '❌ Gagal mendapatkan waifu. Coba lagi nanti.'
            };
        }
    }

    // Get anime sticker by type
    async getAnimeSticker(type = 'random') {
        try {
            const result = await this.apiManager.getAnimeSticker(type);
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return {
                url: null,
                message: '❌ Gagal mendapatkan stiker anime. Coba lagi nanti.'
            };
        }
    }

    // Get anime sticker pack
    async getAnimeStickerPack() {
        try {
            const result = await this.apiManager.getAnimeStickerPack();
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return {
                stickers: [],
                message: '❌ Gagal mendapatkan paket stiker anime. Coba lagi nanti.'
            };
        }
    }

    // Create anime text sticker
    async createAnimeTextSticker(text, style = 'kawaii') {
        try {
            const result = await this.apiManager.createAnimeSticker(text, style);
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return {
                success: false,
                message: '❌ Gagal membuat stiker teks anime. Coba lagi nanti.'
            };
        }
    }

    // Get top anime list
    async getTopAnime() {
        try {
            const result = await this.apiManager.getTopAnime();
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return '❌ Gagal mendapatkan daftar anime terpopuler. Coba lagi nanti.';
        }
    }

    // Search anime by title
    async searchAnime(query) {
        try {
            const result = await this.apiManager.searchAnime(query);
            return result;
        } catch (error) {
            // Removed console.error for faster execution
            return '❌ Gagal mencari anime. Coba lagi nanti.';
        }
    }
}

module.exports = AnimeFeatures;