const axios = require('axios');
const math = require('mathjs');

class GamesHandler {
    constructor(client, database) {
        this.client = client;
        this.db = database;
        this.gameStates = new Map();
        this.quizStates = new Map();
        
        // Game data
        this.gameData = {
            words: ['PROGRAMMING', 'JAVASCRIPT', 'WHATSAPP', 'INDONESIA', 'COMPUTER', 'INTERNET', 'MOBILE', 'ANDROID', 'TECHNOLOGY', 'ARTIFICIAL', 'INTELLIGENCE', 'MACHINE', 'LEARNING', 'DATABASE', 'ALGORITHM'],
            
            quizQuestions: [
                { q: 'Apa ibu kota Indonesia?', a: 'jakarta', options: ['Jakarta', 'Bandung', 'Surabaya', 'Medan'], explanation: 'Jakarta adalah ibu kota Indonesia sejak tahun 1945 dan merupakan pusat pemerintahan negara.' },
                { q: 'Siapa presiden pertama Indonesia?', a: 'soekarno', options: ['Soekarno', 'Soeharto', 'Habibie', 'Megawati'], explanation: 'Soekarno adalah presiden pertama Indonesia yang memproklamirkan kemerdekaan bersama Mohammad Hatta pada 17 Agustus 1945.' },
                { q: 'Berapa hasil 15 x 8?', a: '120', options: ['120', '110', '130', '140'], explanation: '15 x 8 = 120. Ini adalah perkalian dasar matematika.' },
                { q: 'Planet terdekat dengan matahari?', a: 'merkurius', options: ['Merkurius', 'Venus', 'Bumi', 'Mars'], explanation: 'Merkurius adalah planet pertama dalam tata surya yang paling dekat dengan matahari.' },
                { q: 'Bahasa pemrograman yang dibuat oleh Google?', a: 'go', options: ['Go', 'Python', 'Java', 'C++'], explanation: 'Go (atau Golang) adalah bahasa pemrograman yang dikembangkan oleh Google pada tahun 2009.' },
                { q: 'Siapa penemu lampu pijar?', a: 'edison', options: ['Edison', 'Tesla', 'Einstein', 'Newton'], explanation: 'Thomas Edison adalah penemu lampu pijar yang praktis dan dapat diproduksi secara massal.' },
                { q: 'Negara dengan populasi terbesar di dunia?', a: 'china', options: ['China', 'India', 'Amerika', 'Indonesia'], explanation: 'China memiliki populasi terbesar di dunia dengan lebih dari 1,4 miliar penduduk.' },
                { q: 'Berapa jumlah benua di dunia?', a: '7', options: ['5', '6', '7', '8'], explanation: 'Ada 7 benua di dunia: Asia, Afrika, Amerika Utara, Amerika Selatan, Antartika, Eropa, dan Australia.' },
                { q: 'Apa nama mata uang Indonesia?', a: 'rupiah', options: ['Rupiah', 'Ringgit', 'Baht', 'Peso'], explanation: 'Rupiah adalah mata uang resmi Indonesia yang disingkat IDR.' },
                { q: 'Siapa pencipta lagu Indonesia Raya?', a: 'wage rudolf supratman', options: ['W.R. Supratman', 'Ismail Marzuki', 'Gesang', 'Cornel Simanjuntak'], explanation: 'Wage Rudolf Supratman adalah pencipta lagu kebangsaan Indonesia Raya.' },
                { q: 'Berapa jumlah pulau di Indonesia?', a: '17508', options: ['17.508', '13.466', '15.000', '20.000'], explanation: 'Indonesia memiliki 17.508 pulau berdasarkan data resmi pemerintah.' },
                { q: 'Apa nama selat yang memisahkan Jawa dan Sumatera?', a: 'sunda', options: ['Sunda', 'Bali', 'Lombok', 'Makassar'], explanation: 'Selat Sunda memisahkan pulau Jawa dan Sumatera.' },
                { q: 'Siapa pendiri kerajaan Majapahit?', a: 'raden wijaya', options: ['Raden Wijaya', 'Gajah Mada', 'Hayam Wuruk', 'Ken Arok'], explanation: 'Raden Wijaya adalah pendiri kerajaan Majapahit pada tahun 1293.' },
                { q: 'Apa nama gunung tertinggi di Indonesia?', a: 'puncak jaya', options: ['Puncak Jaya', 'Kerinci', 'Rinjani', 'Semeru'], explanation: 'Puncak Jaya (Carstensz Pyramid) adalah gunung tertinggi di Indonesia dengan ketinggian 4.884 meter.' },
                { q: 'Berapa hasil 144 : 12?', a: '12', options: ['12', '10', '14', '16'], explanation: '144 dibagi 12 sama dengan 12. Ini adalah operasi pembagian dasar.' },
                { q: 'Apa nama ibukota Australia?', a: 'canberra', options: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'], explanation: 'Canberra adalah ibukota Australia, bukan Sydney atau Melbourne.' },
                { q: 'Siapa penemu telepon?', a: 'alexander graham bell', options: ['Alexander Graham Bell', 'Thomas Edison', 'Nikola Tesla', 'Guglielmo Marconi'], explanation: 'Alexander Graham Bell adalah penemu telepon pada tahun 1876.' },
                { q: 'Apa nama sungai terpanjang di dunia?', a: 'nil', options: ['Nil', 'Amazon', 'Yangtze', 'Mississippi'], explanation: 'Sungai Nil di Afrika adalah sungai terpanjang di dunia dengan panjang sekitar 6.650 km.' },
                { q: 'Berapa jumlah pemain dalam satu tim sepak bola?', a: '11', options: ['11', '10', '12', '9'], explanation: 'Setiap tim sepak bola terdiri dari 11 pemain termasuk kiper.' },
                { q: 'Apa nama planet terbesar di tata surya?', a: 'jupiter', options: ['Jupiter', 'Saturnus', 'Uranus', 'Neptunus'], explanation: 'Jupiter adalah planet terbesar di tata surya kita.' },
                { q: 'Siapa penemu mesin uap?', a: 'james watt', options: ['James Watt', 'George Stephenson', 'Robert Fulton', 'Thomas Newcomen'], explanation: 'James Watt mengembangkan mesin uap yang efisien pada abad ke-18.' },
                { q: 'Apa nama laut yang berbatasan dengan Indonesia?', a: 'jawa', options: ['Laut Jawa', 'Laut Banda', 'Laut Arafura', 'Semua benar'], explanation: 'Indonesia berbatasan dengan banyak laut, termasuk Laut Jawa, Banda, dan Arafura.' },
                { q: 'Berapa jumlah provinsi di Indonesia?', a: '38', options: ['38', '34', '36', '40'], explanation: 'Indonesia memiliki 38 provinsi berdasarkan pembagian administratif terbaru.' },
                { q: 'Apa nama tari tradisional dari Bali?', a: 'kecak', options: ['Kecak', 'Saman', 'Pendet', 'Legong'], explanation: 'Kecak adalah salah satu tari tradisional terkenal dari Bali.' },
                { q: 'Siapa penemu komputer?', a: 'charles babbage', options: ['Charles Babbage', 'Alan Turing', 'John von Neumann', 'Bill Gates'], explanation: 'Charles Babbage dikenal sebagai "bapak komputer" karena merancang Analytical Engine.' },
                { q: 'Apa nama makanan khas Padang?', a: 'rendang', options: ['Rendang', 'Gudeg', 'Gado-gado', 'Soto'], explanation: 'Rendang adalah makanan khas Padang yang terkenal di dunia.' },
                { q: 'Berapa jumlah huruf dalam alfabet Indonesia?', a: '26', options: ['26', '28', '25', '30'], explanation: 'Alfabet Indonesia menggunakan 26 huruf Latin.' },
                { q: 'Apa nama burung garuda dalam mitologi Hindu?', a: 'garuda', options: ['Garuda', 'Phoenix', 'Simurgh', 'Roc'], explanation: 'Garuda adalah burung mitologi Hindu yang menjadi kendaraan dewa Wisnu.' },
                { q: 'Siapa penemu radio?', a: 'guglielmo marconi', options: ['Guglielmo Marconi', 'Heinrich Hertz', 'Nikola Tesla', 'Lee de Forest'], explanation: 'Guglielmo Marconi adalah penemu radio dan sistem komunikasi nirkabel.' },
                { q: 'Apa nama danau terbesar di Indonesia?', a: 'toba', options: ['Toba', 'Singkarak', 'Maninjau', 'Sentani'], explanation: 'Danau Toba di Sumatera Utara adalah danau terbesar di Indonesia.' }
            ],
            
            siapakahaku: [
                { clue: 'Saya adalah presiden Amerika yang terkenal dengan pidato "I Have a Dream"', answer: 'martin luther king', name: 'Martin Luther King Jr.', explanation: 'Martin Luther King Jr. adalah aktivis hak sipil yang terkenal dengan gerakan anti-rasisme di Amerika.' },
                { clue: 'Saya penemu teori relativitas dan rumus E=mc²', answer: 'einstein', name: 'Albert Einstein', explanation: 'Albert Einstein adalah fisikawan teoretis yang mengembangkan teori relativitas.' },
                { clue: 'Saya pendiri Microsoft dan salah satu orang terkaya di dunia', answer: 'bill gates', name: 'Bill Gates', explanation: 'Bill Gates adalah pendiri Microsoft dan filantropis terkenal.' },
                { clue: 'Saya penemu Facebook dan CEO Meta', answer: 'mark zuckerberg', name: 'Mark Zuckerberg', explanation: 'Mark Zuckerberg adalah pendiri Facebook (sekarang Meta) pada tahun 2004.' },
                { clue: 'Saya presiden pertama Indonesia yang memproklamirkan kemerdekaan', answer: 'soekarno', name: 'Soekarno', explanation: 'Soekarno adalah proklamator kemerdekaan Indonesia bersama Mohammad Hatta.' },
                { clue: 'Saya penemu lampu pijar dan mendirikan General Electric', answer: 'thomas edison', name: 'Thomas Edison', explanation: 'Thomas Edison adalah penemu produktif dengan lebih dari 1.000 paten.' },
                { clue: 'Saya pelukis terkenal yang memotong telinga sendiri', answer: 'vincent van gogh', name: 'Vincent van Gogh', explanation: 'Vincent van Gogh adalah pelukis post-impresionis yang terkenal dengan karya seperti "Starry Night".' },
                { clue: 'Saya penemu telepon dan mendirikan Bell Telephone Company', answer: 'alexander graham bell', name: 'Alexander Graham Bell', explanation: 'Alexander Graham Bell adalah penemu telepon pertama pada tahun 1876.' },
                { clue: 'Saya pemimpin Nazi Jerman yang memulai Perang Dunia II', answer: 'adolf hitler', name: 'Adolf Hitler', explanation: 'Adolf Hitler adalah diktator Nazi yang bertanggung jawab atas Holocaust dan Perang Dunia II.' },
                { clue: 'Saya penemu mesin uap yang revolusioner', answer: 'james watt', name: 'James Watt', explanation: 'James Watt memperbaiki mesin uap yang memicu Revolusi Industri.' },
                { clue: 'Saya penjelajah yang menemukan Amerika pada tahun 1492', answer: 'christopher columbus', name: 'Christopher Columbus', explanation: 'Christopher Columbus adalah penjelajah yang membuka jalur ke Amerika.' },
                { clue: 'Saya penemu penicillin yang menyelamatkan jutaan nyawa', answer: 'alexander fleming', name: 'Alexander Fleming', explanation: 'Alexander Fleming menemukan penicillin, antibiotik pertama yang efektif.' },
                { clue: 'Saya pendiri Apple bersama Steve Wozniak', answer: 'steve jobs', name: 'Steve Jobs', explanation: 'Steve Jobs adalah co-founder Apple yang revolusioner dalam industri teknologi.' },
                { clue: 'Saya presiden Amerika yang memimpin selama Perang Saudara', answer: 'abraham lincoln', name: 'Abraham Lincoln', explanation: 'Abraham Lincoln memimpin Amerika Serikat selama Perang Saudara dan menghapus perbudakan.' },
                { clue: 'Saya wanita pertama yang memenangkan Nobel Prize', answer: 'marie curie', name: 'Marie Curie', explanation: 'Marie Curie adalah wanita pertama yang memenangkan Nobel Prize dan satu-satunya yang memenangkan dua Nobel Prize.' },
                { clue: 'Saya penemu World Wide Web (WWW)', answer: 'tim berners lee', name: 'Tim Berners-Lee', explanation: 'Tim Berners-Lee menciptakan World Wide Web pada tahun 1989.' },
                { clue: 'Saya pendiri Tesla Motors dan SpaceX', answer: 'elon musk', name: 'Elon Musk', explanation: 'Elon Musk adalah entrepreneur yang memimpin Tesla dan SpaceX.' },
                { clue: 'Saya komposer klasik yang tuli namun tetap berkarya', answer: 'ludwig van beethoven', name: 'Ludwig van Beethoven', explanation: 'Beethoven adalah komposer besar yang kehilangan pendengaran namun tetap menciptakan karya masterpiece.' },
                { clue: 'Saya penemu vaksin polio yang menyelamatkan jutaan anak', answer: 'jonas salk', name: 'Jonas Salk', explanation: 'Jonas Salk mengembangkan vaksin polio pertama yang efektif.' },
                { clue: 'Saya pendiri Amazon yang menjadi orang terkaya di dunia', answer: 'jeff bezos', name: 'Jeff Bezos', explanation: 'Jeff Bezos mendirikan Amazon sebagai toko buku online yang berkembang menjadi raksasa e-commerce.' },
                { clue: 'Saya ilmuwan yang mengembangkan teori evolusi', answer: 'charles darwin', name: 'Charles Darwin', explanation: 'Charles Darwin mengembangkan teori evolusi melalui seleksi alam.' },
                { clue: 'Saya penemu mesin cetak yang revolusioner', answer: 'johannes gutenberg', name: 'Johannes Gutenberg', explanation: 'Johannes Gutenberg menciptakan mesin cetak yang mengubah cara penyebaran informasi.' },
                { clue: 'Saya pelukis yang menciptakan lukisan Mona Lisa', answer: 'leonardo da vinci', name: 'Leonardo da Vinci', explanation: 'Leonardo da Vinci adalah seniman dan penemu Renaissance yang menciptakan Mona Lisa.' },
                { clue: 'Saya fisikawan yang mengembangkan hukum gravitasi', answer: 'isaac newton', name: 'Isaac Newton', explanation: 'Isaac Newton merumuskan hukum gravitasi dan hukum gerak.' },
                { clue: 'Saya aktivis hak sipil yang menolak memberikan tempat duduk', answer: 'rosa parks', name: 'Rosa Parks', explanation: 'Rosa Parks memicu gerakan hak sipil dengan menolak memberikan tempat duduk di bus.' },
                { clue: 'Saya pendiri Microsoft bersama Paul Allen', answer: 'bill gates', name: 'Bill Gates', explanation: 'Bill Gates co-founded Microsoft dan menjadi tokoh penting dalam industri komputer.' },
                { clue: 'Saya penemu radio dan sistem komunikasi nirkabel', answer: 'guglielmo marconi', name: 'Guglielmo Marconi', explanation: 'Guglielmo Marconi mengembangkan teknologi radio yang mengubah komunikasi.' },
                { clue: 'Saya penemu X-ray yang mengubah dunia medis', answer: 'wilhelm roentgen', name: 'Wilhelm Roentgen', explanation: 'Wilhelm Roentgen menemukan sinar-X yang revolusioner dalam bidang medis.' },
                { clue: 'Saya penemu DNA double helix bersama Francis Crick', answer: 'james watson', name: 'James Watson', explanation: 'James Watson dan Francis Crick menemukan struktur DNA double helix.' },
                { clue: 'Saya penemu AC (Alternating Current) dan banyak penemuan listrik', answer: 'nikola tesla', name: 'Nikola Tesla', explanation: 'Nikola Tesla adalah penemu brilian yang mengembangkan sistem AC dan banyak teknologi listrik.' }
            ],
            
            tekateki: [
                { q: 'Apa yang bisa berlari tapi tidak punya kaki?', a: 'air', hint: 'Mengalir dari atas ke bawah', explanation: 'Air bisa "berlari" atau mengalir tanpa memiliki kaki.' },
                { q: 'Apa yang punya mata tapi tidak bisa melihat?', a: 'jarum', hint: 'Digunakan untuk menjahit', explanation: 'Jarum memiliki lubang yang disebut "mata jarum" tapi tidak bisa melihat.' },
                { q: 'Apa yang bisa terbang tapi bukan burung?', a: 'pesawat', hint: 'Kendaraan transportasi udara', explanation: 'Pesawat bisa terbang di udara tapi bukan makhluk hidup seperti burung.' },
                { q: 'Apa yang makin dipotong makin panjang?', a: 'parit', hint: 'Lubang di tanah', explanation: 'Parit akan semakin panjang saat terus dipotong atau digali.' },
                { q: 'Apa yang bisa bicara tapi tidak punya mulut?', a: 'gema', hint: 'Suara yang memantul', explanation: 'Gema adalah pantulan suara yang terdengar seperti bicara tapi tidak memiliki mulut.' },
                { q: 'Apa yang selalu basah tapi tidak pernah kering?', a: 'lidah', hint: 'Bagian tubuh di mulut', explanation: 'Lidah selalu basah karena air liur dan tidak pernah benar-benar kering.' },
                { q: 'Apa yang bisa dimakan tapi tidak bisa dikunyah?', a: 'es krim', hint: 'Makanan dingin', explanation: 'Es krim dimakan dengan cara dijilat atau ditelan, bukan dikunyah.' },
                { q: 'Apa yang punya tangan tapi tidak bisa menulis?', a: 'jam', hint: 'Alat penunjuk waktu', explanation: 'Jam memiliki jarum jam yang disebut "tangan jam" tapi tidak bisa menulis.' },
                { q: 'Apa yang bisa pecah tanpa jatuh?', a: 'telur', hint: 'Makanan dari ayam', explanation: 'Telur bisa pecah karena ditekan atau dipukul, tidak harus jatuh.' },
                { q: 'Apa yang punya kepala tapi tidak punya rambut?', a: 'paku', hint: 'Alat untuk memaku', explanation: 'Paku memiliki bagian yang disebut "kepala paku" tapi tidak berambut.' },
                { q: 'Apa yang bisa menangis tapi tidak punya mata?', a: 'awan', hint: 'Ada di langit', explanation: 'Awan bisa "menangis" dalam bentuk hujan tapi tidak memiliki mata.' },
                { q: 'Apa yang bisa bernapas tapi tidak punya paru-paru?', a: 'api', hint: 'Membutuhkan oksigen', explanation: 'Api "bernapas" dengan mengonsumsi oksigen tapi tidak memiliki paru-paru.' },
                { q: 'Apa yang punya sayap tapi tidak bisa terbang?', a: 'ayam', hint: 'Unggas yang berkokok', explanation: 'Ayam memiliki sayap tapi tidak bisa terbang tinggi atau jauh.' },
                { q: 'Apa yang bisa makan tapi tidak punya mulut?', a: 'api', hint: 'Panas dan menyala', explanation: 'Api bisa "memakan" bahan bakar tapi tidak memiliki mulut.' },
                { q: 'Apa yang punya kaki tapi tidak bisa berjalan?', a: 'meja', hint: 'Furniture rumah', explanation: 'Meja memiliki kaki sebagai penyangga tapi tidak bisa berjalan.' },
                { q: 'Apa yang bisa bernyanyi tapi tidak punya suara?', a: 'angin', hint: 'Udara yang bergerak', explanation: 'Angin bisa menghasilkan suara seperti bernyanyi tapi tidak memiliki pita suara.' },
                { q: 'Apa yang punya ekor tapi tidak punya badan?', a: 'koin', hint: 'Alat tukar', explanation: 'Koin memiliki sisi "ekor" (belakang) tapi tidak seperti ekor hewan.' },
                { q: 'Apa yang bisa mengigit tapi tidak punya gigi?', a: 'dingin', hint: 'Suhu rendah', explanation: 'Dingin bisa "mengigit" atau menyakitkan tapi tidak memiliki gigi.' },
                { q: 'Apa yang punya tanduk tapi tidak punya kepala?', a: 'bulan', hint: 'Benda langit', explanation: 'Bulan sabit berbentuk seperti tanduk tapi tidak memiliki kepala.' },
                { q: 'Apa yang bisa menggigil tapi tidak kedinginan?', a: 'daun', hint: 'Bagian tumbuhan', explanation: 'Daun bisa bergetar atau "menggigil" karena angin, bukan karena dingin.' },
                { q: 'Apa yang punya mahkota tapi bukan raja?', a: 'nanas', hint: 'Buah tropis', explanation: 'Nanas memiliki daun di atasnya yang menyerupai mahkota.' },
                { q: 'Apa yang bisa berkeringat tapi tidak punya pori-pori?', a: 'gelas', hint: 'Wadah minum', explanation: 'Gelas berisi air dingin bisa "berkeringat" karena kondensasi udara.' },
                { q: 'Apa yang punya leher tapi tidak punya kepala?', a: 'botol', hint: 'Wadah cairan', explanation: 'Botol memiliki bagian yang disebut "leher botol" tapi tidak berkepala.' },
                { q: 'Apa yang bisa menghilang tapi tidak pernah pergi?', a: 'bayangan', hint: 'Ikuti kemana-mana', explanation: 'Bayangan bisa menghilang saat gelap tapi tidak benar-benar pergi.' },
                { q: 'Apa yang punya sisik tapi bukan ikan?', a: 'naga', hint: 'Makhluk mitologi', explanation: 'Naga dalam mitologi memiliki sisik seperti ikan tapi bukan ikan.' },
                { q: 'Apa yang bisa tumbuh tapi tidak hidup?', a: 'kristal', hint: 'Mineral yang mengeras', explanation: 'Kristal bisa tumbuh menjadi besar tapi bukan makhluk hidup.' },
                { q: 'Apa yang punya bulu tapi bukan burung?', a: 'kuas', hint: 'Alat melukis', explanation: 'Kuas memiliki bulu untuk melukis tapi bukan seekor burung.' },
                { q: 'Apa yang bisa berdarah tapi tidak terluka?', a: 'daging', hint: 'Makanan dari hewan', explanation: 'Daging segar bisa mengeluarkan darah tapi tidak sedang terluka.' },
                { q: 'Apa yang punya kulit tapi tidak bernyawa?', a: 'buah', hint: 'Makanan dari tumbuhan', explanation: 'Buah memiliki kulit sebagai pelindung tapi tidak bernyawa seperti hewan.' },
                { q: 'Apa yang bisa berubah warna tapi bukan bunglon?', a: 'langit', hint: 'Ada di atas kepala', explanation: 'Langit bisa berubah warna dari biru ke merah saat senja, tapi bukan bunglon.' }
            ],
            
            asahotak: [
                { q: 'Jika 2 + 2 = 4, 3 + 3 = 6, maka 4 + 4 = ?', a: '8', hint: 'Penjumlahan sederhana', explanation: 'Pola penjumlahan: setiap angka ditambah dengan dirinya sendiri.' },
                { q: 'Apa yang selalu naik tapi tidak pernah turun?', a: 'umur', hint: 'Sesuatu tentang waktu', explanation: 'Umur seseorang selalu bertambah seiring waktu dan tidak pernah berkurang.' },
                { q: 'Berapa banyak bulan yang memiliki 28 hari?', a: '12', hint: 'Semua bulan punya minimal 28 hari', explanation: 'Semua 12 bulan memiliki minimal 28 hari, tidak hanya Februari.' },
                { q: 'Apa yang bisa kamu pecahkan tanpa menyentuhnya?', a: 'janji', hint: 'Sesuatu yang abstrak', explanation: 'Janji bisa "dipecahkan" atau dilanggar tanpa menyentuh secara fisik.' },
                { q: 'Jika kamu di ruangan gelap dengan korek api, lilin, dan lampu minyak, apa yang kamu nyalakan pertama?', a: 'korek api', hint: 'Alat untuk menyalakan', explanation: 'Korek api harus dinyalakan dulu sebelum bisa menyalakan yang lain.' },
                { q: 'Seorang ayah dan anak laki-laki mengalami kecelakaan. Ayah meninggal, anak dibawa ke rumah sakit. Dokter berkata "Saya tidak bisa operasi, ini anak saya". Bagaimana mungkin?', a: 'dokter adalah ibunya', hint: 'Pikirkan jenis kelamin', explanation: 'Dokter tersebut adalah ibu dari anak laki-laki itu.' },
                { q: 'Apa yang menjadi basah saat mengeringkan?', a: 'handuk', hint: 'Alat untuk mengeringkan', explanation: 'Handuk menjadi basah ketika digunakan untuk mengeringkan sesuatu.' },
                { q: 'Mobil listrik berjalan ke utara. Angin bertiup ke selatan. Ke arah mana asap knalpot pergi?', a: 'tidak ada asap', hint: 'Pikirkan jenis mobil', explanation: 'Mobil listrik tidak menghasilkan asap knalpot.' },
                { q: 'Apa yang bisa kamu genggam di tangan kanan tapi tidak di tangan kiri?', a: 'siku kiri', hint: 'Bagian tubuh', explanation: 'Tangan kanan bisa memegang siku kiri, tapi tangan kiri tidak bisa memegang siku kiri sendiri.' },
                { q: 'Jika ada 3 apel dan kamu ambil 2, berapa apel yang kamu miliki?', a: '2', hint: 'Yang kamu ambil', explanation: 'Kamu memiliki 2 apel karena itulah yang kamu ambil.' },
                { q: 'Apa yang memiliki 4 kaki di pagi hari, 2 kaki di siang hari, dan 3 kaki di malam hari?', a: 'manusia', hint: 'Tahap kehidupan', explanation: 'Manusia merangkak (4 kaki) saat bayi, berjalan (2 kaki) saat dewasa, dan menggunakan tongkat (3 kaki) saat tua.' },
                { q: 'Berapa detik dalam setahun?', a: '12', hint: 'Bukan tentang waktu', explanation: 'Ada 12 bulan yang kedua: 2 Januari, 2 Februari, dst.' },
                { q: 'Apa yang bisa melaju dengan kecepatan cahaya?', a: 'bayangan', hint: 'Mengikuti benda', explanation: 'Bayangan bisa bergerak dengan kecepatan cahaya karena cahaya itu sendiri.' },
                { q: 'Jika satu dokter memberikan pil kepada 3 pasien setiap setengah jam, berapa lama untuk memberikan 18 pil?', a: '3 jam', hint: 'Berapa kali memberikan', explanation: '18 pil dibagi 3 pasien = 6 kali pemberian. 6 x 30 menit = 180 menit = 3 jam.' },
                { q: 'Apa yang bisa dilihat setiap hari tapi tidak pernah dua kali sama?', a: 'matahari terbenam', hint: 'Fenomena alam', explanation: 'Matahari terbenam selalu terlihat berbeda setiap hari karena kondisi cuaca dan atmosfer.' },
                { q: 'Berapa kali huruf "F" muncul dalam kalimat ini: "FINISHED FILES ARE THE RESULT OF YEARS OF SCIENTIFIC STUDY"?', a: '6', hint: 'Hitung semua huruf F', explanation: 'Ada 6 huruf F: FINISHED, FILES, OF, OF, SCIENTIFIC (jangan lupakan kata "OF").' },
                { q: 'Apa yang bisa kamu buat tapi tidak bisa dilihat?', a: 'suara', hint: 'Sesuatu yang didengar', explanation: 'Suara bisa dibuat dengan berbicara atau alat musik tapi tidak bisa dilihat.' },
                { q: 'Jika kamu memiliki kotak dengan 10 bola hitam dan 10 bola putih, berapa minimal bola yang harus diambil untuk mendapat 2 bola warna sama?', a: '3', hint: 'Pikirkan kemungkinan terburuk', explanation: 'Kemungkinan terburuk: ambil 1 hitam, 1 putih, maka yang ke-3 pasti sama dengan salah satu.' },
                { q: 'Apa yang bisa dipecahkan tanpa pernah dipegang?', a: 'rekor', hint: 'Prestasi', explanation: 'Rekor bisa dipecahkan atau dipatahkan tanpa menyentuh secara fisik.' },
                { q: 'Jika kemarin adalah hari setelah Senin, hari apa kemarin lusa?', a: 'minggu', hint: 'Hitung mundur', explanation: 'Kemarin = Selasa, lusa = Kamis, kemarin lusa = Minggu.' },
                { q: 'Apa yang bisa naik turun tapi tidak bergerak?', a: 'suhu', hint: 'Kondisi udara', explanation: 'Suhu bisa naik dan turun tapi suhu itu sendiri tidak bergerak.' },
                { q: 'Berapa kali angka 9 muncul dari 1 sampai 100?', a: '20', hint: 'Hitung di semua posisi', explanation: '9, 19, 29, 39, 49, 59, 69, 79, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99 (99 ada 2 angka 9).' },
                { q: 'Apa yang bisa kamu berikan kepada orang lain tapi tetap memilikinya?', a: 'nasihat', hint: 'Sesuatu yang dibagikan', explanation: 'Nasihat bisa diberikan kepada orang lain tapi kamu tetap memiliki pengetahuan itu.' },
                { q: 'Jika 5 mesin membuat 5 widget dalam 5 menit, berapa lama 100 mesin membuat 100 widget?', a: '5 menit', hint: 'Perhatikan rasionya', explanation: 'Setiap mesin membuat 1 widget dalam 5 menit, jadi 100 mesin membuat 100 widget dalam 5 menit.' },
                { q: 'Apa yang bisa kamu ambil tapi tidak bisa memberikan kembali?', a: 'nyawa', hint: 'Sesuatu yang berharga', explanation: 'Nyawa bisa diambil tapi tidak bisa dikembalikan lagi.' },
                { q: 'Berapa banyak hewan yang dibawa Nabi Musa ke bahtera?', a: '0', hint: 'Siapa yang membawa bahtera?', explanation: 'Nabi Nuh yang membawa hewan ke bahtera, bukan Nabi Musa.' },
                { q: 'Apa yang bisa tumbuh tapi tidak pernah mati?', a: 'pengetahuan', hint: 'Sesuatu yang abstrak', explanation: 'Pengetahuan bisa terus bertambah dan tidak pernah benar-benar mati.' },
                { q: 'Jika hari ini adalah hari Rabu, hari apa 100 hari lagi?', a: 'jumat', hint: 'Siklus 7 hari', explanation: '100 ÷ 7 = 14 sisa 2. Rabu + 2 hari = Jumat.' },
                { q: 'Apa yang bisa kamu dengar tapi tidak bisa dilihat atau disentuh?', a: 'pikiran', hint: 'Aktivitas mental', explanation: 'Pikiran bisa "didengar" dalam kepala tapi tidak bisa dilihat atau disentuh.' },
                { q: 'Berapa banyak bulan yang memiliki 30 hari?', a: '11', hint: 'Kecuali Februari', explanation: 'Semua bulan memiliki 30 hari kecuali Februari yang hanya 28/29 hari.' }
            ],
            
            caklontong: [
                { q: 'Kenapa ayam jago tidak pernah telat bangun pagi?', a: 'karena dia punya alarm', hint: 'Suara khas ayam jago', explanation: 'Ayam jago berkokok sebagai "alarm" alami setiap pagi.' },
                { q: 'Apa bedanya semut dengan orang kaya?', a: 'semut punya rumah', hint: 'Tempat tinggal', explanation: 'Semut punya rumah (sarang), sedangkan orang kaya belum tentu punya rumah.' },
                { q: 'Kenapa ikan tidak pernah bayar pajak?', a: 'karena dia hidup di air', hint: 'Tempat tinggal ikan', explanation: 'Ikan hidup di air, bukan di darat yang ada sistem pajak.' },
                { q: 'Apa persamaan antara uang dan rahasia?', a: 'sama-sama susah dipegang', hint: 'Sifat keduanya', explanation: 'Uang dan rahasia sama-sama sulit untuk dipegang atau disimpan lama.' },
                { q: 'Kenapa orang botak tidak pernah kehilangan sisir?', a: 'karena dia tidak punya', hint: 'Tidak butuh sisir', explanation: 'Orang botak tidak punya rambut jadi tidak butuh sisir.' },
                { q: 'Apa bedanya dokter dengan malaikat?', a: 'dokter pakai jas putih', hint: 'Pakaian', explanation: 'Dokter memakai jas putih, sedangkan malaikat digambarkan berpakaian putih tapi bukan jas.' },
                { q: 'Kenapa hantu tidak pernah lapar?', a: 'karena dia tidak punya perut', hint: 'Bagian tubuh', explanation: 'Hantu tidak memiliki tubuh fisik termasuk perut untuk merasa lapar.' },
                { q: 'Apa persamaan antara pisang dan sepatu?', a: 'sama-sama bisa dikupas', hint: 'Aktivitas yang bisa dilakukan', explanation: 'Pisang bisa dikupas kulitnya, sepatu bisa dikupas dari kaki.' },
                { q: 'Kenapa cicak tidak pernah jatuh dari dinding?', a: 'karena dia punya lem', hint: 'Kemampuan menempel', explanation: 'Cicak punya bantalan lengket di kaki seperti lem alami.' },
                { q: 'Apa bedanya burung dengan pesawat?', a: 'burung tidak perlu tiket', hint: 'Syarat terbang', explanation: 'Burung bisa terbang tanpa tiket, sedangkan pesawat butuh tiket.' },
                { q: 'Kenapa kucing tidak pernah pakai kacamata?', a: 'karena dia bisa lihat dalam gelap', hint: 'Kemampuan mata', explanation: 'Kucing punya penglihatan malam yang baik jadi tidak butuh kacamata.' },
                { q: 'Apa persamaan antara gajah dan tikus?', a: 'sama-sama punya ekor', hint: 'Bagian tubuh', explanation: 'Gajah dan tikus sama-sama memiliki ekor meski ukurannya berbeda.' },
                { q: 'Kenapa ular tidak pernah pakai sepatu?', a: 'karena dia tidak punya kaki', hint: 'Bagian tubuh', explanation: 'Ular tidak memiliki kaki jadi tidak butuh sepatu.' },
                { q: 'Apa bedanya lampu dengan lilin?', a: 'lampu pakai listrik', hint: 'Sumber energi', explanation: 'Lampu menggunakan listrik, sedangkan lilin menggunakan api.' },
                { q: 'Kenapa ikan mas tidak pernah menangis?', a: 'karena dia sudah di air', hint: 'Lingkungan hidup', explanation: 'Ikan mas hidup di air jadi air mata tidak terlihat.' },
                { q: 'Apa persamaan antara matahari dan guru?', a: 'sama-sama memberikan pencerahan', hint: 'Fungsi memberikan', explanation: 'Matahari memberikan cahaya, guru memberikan ilmu/pencerahan.' },
                { q: 'Kenapa nyamuk tidak pernah gemuk?', a: 'karena dia cuma minum', hint: 'Pola makan', explanation: 'Nyamuk hanya minum darah, tidak makan makanan padat.' },
                { q: 'Apa bedanya singa dengan kucing?', a: 'singa punya jenggot', hint: 'Ciri fisik', explanation: 'Singa jantan memiliki rambut lebat di leher seperti jenggot.' },
                { q: 'Kenapa kelelawar tidur terbalik?', a: 'karena dia takut jatuh', hint: 'Posisi tidur', explanation: 'Kelelawar tidur menggantung supaya tidak jatuh dari tempat tinggi.' },
                { q: 'Apa persamaan antara jam dan ayah?', a: 'sama-sama punya jarum', hint: 'Bagian yang dimiliki', explanation: 'Jam punya jarum penunjuk, ayah punya jarum jahit (jika bisa menjahit).' },
                { q: 'Kenapa belalang tidak pernah pakai helm?', a: 'karena dia bisa loncat', hint: 'Kemampuan gerak', explanation: 'Belalang bisa melompat menghindari bahaya jadi tidak butuh helm.' },
                { q: 'Apa bedanya buaya dengan sandal?', a: 'buaya hidup di air', hint: 'Tempat hidup', explanation: 'Buaya hidup di air, sedangkan sandal dipakai di darat.' },
                { q: 'Kenapa laba-laba tidak pernah tersesat?', a: 'karena dia punya GPS', hint: 'Kemampuan navigasi', explanation: 'Laba-laba punya jaring sebagai "GPS" untuk mengetahui lokasinya.' },
                { q: 'Apa persamaan antara pensil dan dokter?', a: 'sama-sama bisa menghapus', hint: 'Kemampuan memperbaiki', explanation: 'Pensil bisa dihapus, dokter bisa "menghapus" penyakit.' },
                { q: 'Kenapa elang tidak pernah pakai kacamata hitam?', a: 'karena dia sudah keren', hint: 'Penampilan', explanation: 'Elang sudah terlihat keren secara alami tanpa kacamata hitam.' },
                { q: 'Apa bedanya televisi dengan cermin?', a: 'televisi ada suaranya', hint: 'Fitur yang dimiliki', explanation: 'Televisi bisa mengeluarkan suara, cermin hanya menampilkan gambar.' },
                { q: 'Kenapa siput tidak pernah terburu-buru?', a: 'karena dia sudah bawa rumah', hint: 'Bawaan', explanation: 'Siput membawa rumah (cangkang) di punggungnya jadi tidak perlu terburu-buru pulang.' },
                { q: 'Apa persamaan antara es dan mantan?', a: 'sama-sama bikin dingin', hint: 'Efek yang ditimbulkan', explanation: 'Es membuat dingin secara fisik, mantan membuat dingin secara perasaan.' },
                { q: 'Kenapa katak tidak pernah minum air?', a: 'karena dia sudah basah', hint: 'Kondisi tubuh', explanation: 'Katak selalu basah karena hidup di air jadi tidak perlu minum.' },
                { q: 'Apa bedanya mobil dengan kura-kura?', a: 'mobil tidak bisa sembunyi', hint: 'Kemampuan bertahan', explanation: 'Kura-kura bisa menyembunyikan kepala dan kaki ke dalam cangkang, mobil tidak bisa.' }
            ]
        };
    }
    // Quiz Game
    async startKuis(chatId) {
        const question = this.gameData.quizQuestions[Math.floor(Math.random() * this.gameData.quizQuestions.length)];
        const timer = 30;
        
        this.quizStates.set(chatId, {
            question: question,
            startTime: Date.now(),
            timer: timer,
            participants: new Map()
        });
        
        setTimeout(() => {
            const state = this.quizStates.get(chatId);
            if (state) {
                this.quizStates.delete(chatId);
            }
        }, timer * 1000);
        
        return `🧠 *KUIS INTERAKTIF*\n\n❓ ${question.q}\n\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\n⏰ Waktu: ${timer} detik\n💡 Ketik nomor jawaban (1-4)\n🏳️ Ketik "menyerah" untuk menyerah`;
    }
    
    // Word Guessing Game
    async startTebakKata(chatId) {
        const word = this.gameData.words[Math.floor(Math.random() * this.gameData.words.length)];
        const hints = [
            word.charAt(0) + '_'.repeat(word.length - 1),
            word.substring(0, 2) + '_'.repeat(word.length - 2),
            word.substring(0, 3) + '_'.repeat(word.length - 3)
        ];
        
        this.gameStates.set(chatId, {
            type: 'tebakkata',
            word: word,
            hints: hints,
            currentHint: 0,
            attempts: 0,
            maxAttempts: 5,
            startTime: Date.now()
        });
        
        return `🎯 *TEBAK KATA*\n\n🔤 Kata: ${hints[0]}\n💡 Hint: ${word.length} huruf\n🎯 Tebakan: 0/5\n\n💬 Ketik jawaban kamu!\n🏳️ Ketik "menyerah" untuk menyerah`;
    }
    
    // Rock Paper Scissors
    async playSuit(choice) {
        const choices = ['gunting', 'batu', 'kertas'];
        const botChoice = choices[Math.floor(Math.random() * choices.length)];
        const userChoice = choice.toLowerCase();
        
        if (!choices.includes(userChoice)) {
            return '❌ Pilihan tidak valid! Gunakan: gunting, batu, atau kertas';
        }
        
        let result;
        let points = 0;
        
        if (userChoice === botChoice) {
            result = 'SERI';
            points = 10;
        } else if (
            (userChoice === 'gunting' && botChoice === 'kertas') ||
            (userChoice === 'batu' && botChoice === 'gunting') ||
            (userChoice === 'kertas' && botChoice === 'batu')
        ) {
            result = 'MENANG';
            points = 20;
        } else {
            result = 'KALAH';
            points = 5;
        }
        
        const emojis = {
            gunting: '✂️',
            batu: '🗿',
            kertas: '📄'
        };
        
        return {
            message: `🎮 *SUIT GAME*\n\n👤 Kamu: ${emojis[userChoice]} ${userChoice}\n🤖 Bot: ${emojis[botChoice]} ${botChoice}\n\n🏆 Hasil: *${result}*\n💰 +${points} points!`,
            points: points,
            result: result
        };
    }
    
    // Slot Machine
    async playSlot() {
        const symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '💎', '⭐', '🔔'];
        const reels = [
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
        ];
        
        let points = 0;
        let result = '';
        
        if (reels[0] === reels[1] && reels[1] === reels[2]) {
            if (reels[0] === '💎') {
                points = 100;
                result = 'JACKPOT DIAMOND!';
            } else if (reels[0] === '⭐') {
                points = 75;
                result = 'SUPER WIN!';
            } else {
                points = 50;
                result = 'BIG WIN!';
            }
        } else if (reels[0] === reels[1] || reels[1] === reels[2] || reels[0] === reels[2]) {
            points = 20;
            result = 'SMALL WIN!';
        } else {
            points = 5;
            result = 'Try Again!';
        }
        
        return {
            message: `🎰 *SLOT MACHINE*\n\n[ ${reels.join(' | ')} ]\n\n🏆 ${result}\n💰 +${points} points!`,
            points: points
        };
    }
    
    // Math Game
    async startMathGame(chatId) {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        switch (operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 25;
                num2 = Math.floor(Math.random() * 25) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
        }
        
        this.gameStates.set(chatId, {
            type: 'math',
            question: `${num1} ${operation} ${num2}`,
            answer: answer,
            attempts: 0,
            maxAttempts: 3,
            startTime: Date.now(),
            timeLimit: 30000
        });
        
        setTimeout(() => {
            const state = this.gameStates.get(chatId);
            if (state && state.type === 'math') {
                this.gameStates.delete(chatId);
            }
        }, 30000);
        
        return `🧮 *MATH CHALLENGE*\n\n❓ Berapa hasil dari: *${num1} ${operation} ${num2}* ?\n\n⏰ Waktu: 30 detik\n🎯 Kesempatan: 3x\n\n💬 Ketik jawaban angka!\n🏳️ Ketik "menyerah" untuk menyerah`;
    }
    
    // Siapa Kah Aku Game
    async startSiapaKahAku(chatId) {
        const character = this.gameData.siapakahaku[Math.floor(Math.random() * this.gameData.siapakahaku.length)];
        
        this.gameStates.set(chatId, {
            type: 'siapakahaku',
            character: character,
            attempts: 0,
            maxAttempts: 3,
            startTime: Date.now()
        });
        
        return `🤔 *SIAPA KAH AKU?*\n\n💭 Clue: ${character.clue}\n\n🎯 Tebakan: 0/3\n💡 Ketik nama tokoh yang kamu tebak!\n🏳️ Ketik "menyerah" untuk menyerah`;
    }
    
    // Susun Kata Game
    async startSusunKata(chatId) {
        const word = this.gameData.words[Math.floor(Math.random() * this.gameData.words.length)];
        const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
        
        this.gameStates.set(chatId, {
            type: 'susunkata',
            word: word,
            scrambled: scrambled,
            attempts: 0,
            maxAttempts: 5,
            startTime: Date.now()
        });
        
        return `🔤 *SUSUN KATA*\n\n🎯 Susun huruf ini: *${scrambled}*\n💡 Hint: ${word.length} huruf\n🎯 Tebakan: 0/5\n\n💬 Ketik kata yang benar!\n🏳️ Ketik "menyerah" untuk menyerah`;
    }
    
    // Teka Teki Game
    async startTekaTeki(chatId) {
        const riddle = this.gameData.tekateki[Math.floor(Math.random() * this.gameData.tekateki.length)];
        
        this.gameStates.set(chatId, {
            type: 'tekateki',
            riddle: riddle,
            attempts: 0,
            maxAttempts: 3,
            startTime: Date.now()
        });
        
        return `🧩 *TEKA-TEKI*\n\n❓ ${riddle.q}\n\n🎯 Tebakan: 0/3\n💡 Ketik 'hint' untuk petunjuk\n🏳️ Ketik "menyerah" untuk menyerah\n\n💬 Ketik jawaban kamu!`;
    }
    
    // Asah Otak Game
    async startAsahOtak(chatId) {
        const puzzle = this.gameData.asahotak[Math.floor(Math.random() * this.gameData.asahotak.length)];
        
        this.gameStates.set(chatId, {
            type: 'asahotak',
            puzzle: puzzle,
            attempts: 0,
            maxAttempts: 3,
            startTime: Date.now()
        });
        
        return `🧠 *ASAH OTAK*\n\n🤔 ${puzzle.q}\n\n🎯 Tebakan: 0/3\n💡 Ketik 'hint' untuk petunjuk\n🏳️ Ketik "menyerah" untuk menyerah\n\n💬 Ketik jawaban kamu!`;
    }
    
    // Cak Lontong Game
    async startCakLontong(chatId) {
        const joke = this.gameData.caklontong[Math.floor(Math.random() * this.gameData.caklontong.length)];
        
        this.gameStates.set(chatId, {
            type: 'caklontong',
            joke: joke,
            attempts: 0,
            maxAttempts: 3,
            startTime: Date.now()
        });
        
        return `😄 *CAK LONTONG QUIZ*\n\n❓ ${joke.q}\n\n🎯 Tebakan: 0/3\n💡 Ketik 'hint' untuk petunjuk\n🏳️ Ketik "menyerah" untuk menyerah\n\n💬 Ketik jawaban kamu!`;
    }
    
    // Handle Game Answers
    async handleGameAnswer(chatId, userId, answer) {
        const gameState = this.gameStates.get(chatId);
        if (!gameState) return null;
        
        const lowerAnswer = answer.toLowerCase().trim();
        
        // Handle surrender command
        if (lowerAnswer === 'menyerah' || lowerAnswer === 'surrender' || lowerAnswer === 'give up') {
            return this.surrenderGame(chatId, gameState, userId);
        }
        
        gameState.attempts++;
        
        let response = null;
        let points = 0;
        
        switch (gameState.type) {
            case 'tebakkata':
                if (lowerAnswer === gameState.word.toLowerCase()) {
                    points = Math.max(25 - (gameState.attempts * 5), 5);
                    response = `🎉 *BENAR!*\n\nJawaban: *${gameState.word}*\n💰 +${points} points!\n⏱️ Waktu: ${Math.floor((Date.now() - gameState.startTime) / 1000)}s`;
                    this.gameStates.delete(chatId);
                } else if (gameState.attempts >= gameState.maxAttempts) {
                    response = `❌ *GAME OVER!*\n\nJawaban yang benar: *${gameState.word}*\n💰 +5 points untuk mencoba!`;
                    points = 5;
                    this.gameStates.delete(chatId);
                } else {
                    const hintIndex = Math.min(gameState.currentHint + 1, gameState.hints.length - 1);
                    gameState.currentHint = hintIndex;
                    response = `❌ Salah! Coba lagi...\n\n🔤 Hint: ${gameState.hints[hintIndex]}\n🎯 Sisa tebakan: ${gameState.maxAttempts - gameState.attempts}`;
                }
                break;
                
            case 'math':
                if (parseInt(lowerAnswer) === gameState.answer) {
                    const timeBonus = Math.max(30 - Math.floor((Date.now() - gameState.startTime) / 1000), 0);
                    points = 20 + timeBonus;
                    response = `🎉 *BENAR!*\n\n${gameState.question} = *${gameState.answer}*\n💰 +${points} points!\n⚡ Time bonus: +${timeBonus}`;
                    this.gameStates.delete(chatId);
                } else if (gameState.attempts >= gameState.maxAttempts) {
                    response = `❌ *GAME OVER!*\n\n${gameState.question} = *${gameState.answer}*\n💰 +5 points untuk mencoba!`;
                    points = 5;
                    this.gameStates.delete(chatId);
                } else {
                    response = `❌ Salah! Coba lagi...\n🎯 Sisa kesempatan: ${gameState.maxAttempts - gameState.attempts}`;
                }
                break;
                
            case 'siapakahaku':
                if (lowerAnswer.includes(gameState.character.answer)) {
                    points = Math.max(30 - (gameState.attempts * 5), 10);
                    response = `🎉 *BENAR!*\n\nJawabannya: *${gameState.character.name}*\n💰 +${points} points!`;
                    this.gameStates.delete(chatId);
                } else if (gameState.attempts >= gameState.maxAttempts) {
                    response = `❌ *GAME OVER!*\n\nJawabannya: *${gameState.character.name}*\n💰 +5 points untuk mencoba!`;
                    points = 5;
                    this.gameStates.delete(chatId);
                } else {
                    response = `❌ Salah! Coba lagi...\n🎯 Sisa tebakan: ${gameState.maxAttempts - gameState.attempts}`;
                }
                break;
                
            case 'susunkata':
                if (lowerAnswer === gameState.word.toLowerCase()) {
                    points = Math.max(25 - (gameState.attempts * 3), 10);
                    response = `🎉 *BENAR!*\n\nKata: *${gameState.word}*\nDari: ${gameState.scrambled}\n💰 +${points} points!`;
                    this.gameStates.delete(chatId);
                } else if (gameState.attempts >= gameState.maxAttempts) {
                    response = `❌ *GAME OVER!*\n\nKata yang benar: *${gameState.word}*\n💰 +5 points untuk mencoba!`;
                    points = 5;
                    this.gameStates.delete(chatId);
                } else {
                    response = `❌ Salah! Coba lagi...\n🎯 Sisa tebakan: ${gameState.maxAttempts - gameState.attempts}`;
                }
                break;
                
            case 'tekateki':
                if (lowerAnswer === 'hint') {
                    response = `💡 *HINT:* ${gameState.riddle.hint}`;
                } else if (lowerAnswer === gameState.riddle.a.toLowerCase()) {
                    points = Math.max(20 - (gameState.attempts * 3), 8);
                    response = `🎉 *BENAR!*\n\nJawaban: *${gameState.riddle.a}*\n💰 +${points} points!`;
                    this.gameStates.delete(chatId);
                } else if (gameState.attempts >= gameState.maxAttempts) {
                    response = `❌ *GAME OVER!*\n\nJawaban: *${gameState.riddle.a}*\n💰 +5 points untuk mencoba!`;
                    points = 5;
                    this.gameStates.delete(chatId);
                } else {
                    response = `❌ Salah! Coba lagi...\n🎯 Sisa tebakan: ${gameState.maxAttempts - gameState.attempts}`;
                }
                break;
                
            case 'asahotak':
                if (lowerAnswer === 'hint') {
                    response = `💡 *HINT:* ${gameState.puzzle.hint}`;
                } else if (lowerAnswer === gameState.puzzle.a.toLowerCase()) {
                    points = Math.max(25 - (gameState.attempts * 4), 10);
                    response = `🎉 *BENAR!*\n\nJawaban: *${gameState.puzzle.a}*\n💰 +${points} points!`;
                    this.gameStates.delete(chatId);
                } else if (gameState.attempts >= gameState.maxAttempts) {
                    response = `❌ *GAME OVER!*\n\nJawaban: *${gameState.puzzle.a}*\n💰 +5 points untuk mencoba!`;
                    points = 5;
                    this.gameStates.delete(chatId);
                } else {
                    response = `❌ Salah! Coba lagi...\n🎯 Sisa tebakan: ${gameState.maxAttempts - gameState.attempts}`;
                }
                break;
                
            case 'caklontong':
                if (lowerAnswer === 'hint') {
                    response = `💡 *HINT:* ${gameState.joke.hint}`;
                } else if (lowerAnswer.includes(gameState.joke.a.toLowerCase())) {
                    points = Math.max(15 - (gameState.attempts * 2), 8);
                    response = `🎉 *BENAR!*\n\nJawaban: *${gameState.joke.a}*\n💰 +${points} points!`;
                    this.gameStates.delete(chatId);
                } else if (gameState.attempts >= gameState.maxAttempts) {
                    response = `❌ *GAME OVER!*\n\nJawaban: *${gameState.joke.a}*\n💰 +5 points untuk mencoba!`;
                    points = 5;
                    this.gameStates.delete(chatId);
                } else {
                    response = `❌ Salah! Coba lagi...\n🎯 Sisa tebakan: ${gameState.maxAttempts - gameState.attempts}`;
                }
                break;
        }
        
        if (points > 0 && this.db) {
            this.db.updateUserPoints(userId, points);
            this.db.updateUserExp(userId, points);
        }
        
        return response;
    }
    
    // Surrender Game
    surrenderGame(chatId, gameState, userId) {
        let response = '';
        let correctAnswer = '';
        
        switch (gameState.type) {
            case 'tebakkata':
                correctAnswer = gameState.word;
                response = `🏳️ *MENYERAH!*\n\n🔤 Jawaban yang benar: *${correctAnswer}*\n💰 +3 points untuk mencoba!`;
                break;
            case 'math':
                correctAnswer = gameState.answer;
                response = `🏳️ *MENYERAH!*\n\n🧮 ${gameState.question} = *${correctAnswer}*\n💰 +3 points untuk mencoba!`;
                break;
            case 'siapakahaku':
                correctAnswer = gameState.character.name;
                response = `🏳️ *MENYERAH!*\n\n👤 Jawabannya: *${correctAnswer}*\n💰 +3 points untuk mencoba!`;
                break;
            case 'susunkata':
                correctAnswer = gameState.word;
                response = `🏳️ *MENYERAH!*\n\n🔤 Kata yang benar: *${correctAnswer}*\nDari: ${gameState.scrambled}\n💰 +3 points untuk mencoba!`;
                break;
            case 'tekateki':
                correctAnswer = gameState.riddle.a;
                response = `🏳️ *MENYERAH!*\n\n🧩 Jawaban: *${correctAnswer}*\n💰 +3 points untuk mencoba!`;
                break;
            case 'asahotak':
                correctAnswer = gameState.puzzle.a;
                response = `🏳️ *MENYERAH!*\n\n🧠 Jawaban: *${correctAnswer}*\n💰 +3 points untuk mencoba!`;
                break;
            case 'caklontong':
                correctAnswer = gameState.joke.a;
                response = `🏳️ *MENYERAH!*\n\n😄 Jawaban: *${correctAnswer}*\n💰 +3 points untuk mencoba!`;
                break;
            default:
                response = `🏳️ *MENYERAH!*\n\n💰 +3 points untuk mencoba!`;
        }
        
        // Give surrender points
        if (this.db && userId) {
            this.db.updateUserPoints(userId, 3);
            this.db.updateUserExp(userId, 3);
        }
        
        // Remove game state
        this.gameStates.delete(chatId);
        
        return response;
    }

    // Handle Quiz Answers
    async handleQuizAnswer(chatId, userId, answer) {
        const quizState = this.quizStates.get(chatId);
        if (!quizState) return null;
        
        // Handle surrender for quiz
        const lowerAnswer = answer.toLowerCase().trim();
        if (lowerAnswer === 'menyerah' || lowerAnswer === 'surrender' || lowerAnswer === 'give up') {
            const correctOption = quizState.question.options.find(opt => opt.toLowerCase() === quizState.question.a.toLowerCase());
            const response = `🏳️ *MENYERAH!*\n\n❓ ${quizState.question.q}\n✅ Jawaban yang benar: *${correctOption}*\n💰 +3 points untuk mencoba!`;
            
            if (this.db) {
                this.db.updateUserPoints(userId, 3);
                this.db.updateUserExp(userId, 3);
            }
            
            this.quizStates.delete(chatId);
            return response;
        }
        
        const answerNum = parseInt(answer);
        if (answerNum < 1 || answerNum > 4) {
            return '❌ Jawaban harus berupa angka 1-4!\n💡 Ketik "menyerah" jika ingin menyerah';
        }
        
        const selectedOption = quizState.question.options[answerNum - 1];
        const isCorrect = selectedOption.toLowerCase() === quizState.question.a.toLowerCase();
        
        let points = 0;
        let response = '';
        
        if (isCorrect) {
            const timeElapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
            const timeBonus = Math.max(30 - timeElapsed, 0);
            points = 25 + timeBonus;
            response = `🎉 *BENAR!*\n\nJawaban: ${selectedOption}\n💰 +${points} points!\n⚡ Time bonus: +${timeBonus}`;
        } else {
            points = 5;
            response = `❌ *SALAH!*\n\nJawaban yang benar: ${quizState.question.options.find(opt => opt.toLowerCase() === quizState.question.a.toLowerCase())}\n💰 +${points} points untuk mencoba!`;
        }
        
        if (this.db) {
            this.db.updateUserPoints(userId, points);
            this.db.updateUserExp(userId, points);
        }
        
        this.quizStates.delete(chatId);
        return response;
    }
    
    // Start Game - Universal game starter
    async startGame(gameType, chatId, options = {}) {
        switch (gameType) {
            case 'kuis':
                return this.startKuis(chatId);
            case 'tebakkata':
                return this.startTebakKata(chatId);
            case 'suit':
                return this.playSuit(options.choice);
            case 'slot':
                return this.playSlot();
            case 'siapakahaku':
                return this.startSiapaKahAku(chatId);
            case 'tekateki':
                return this.startTekaTeki(chatId);
            case 'asahotak':
                return this.startAsahOtak(chatId);
            case 'caklontong':
                return this.startCakLontong(chatId);
            case 'susunkata':
                return this.startSusunKata(chatId);
            case 'math':
                return this.startMathGame(chatId);
            default:
                return '❌ Game tidak ditemukan!';
        }
    }

    // Get active games
    getActiveGames() {
        return {
            games: this.gameStates.size,
            quizzes: this.quizStates.size
        };
    }
    
    // Clear expired games
    clearExpiredGames() {
        const now = Date.now();
        const expireTime = 5 * 60 * 1000; // 5 minutes
        
        for (const [chatId, state] of this.gameStates.entries()) {
            if (now - state.startTime > expireTime) {
                this.gameStates.delete(chatId);
            }
        }
        
        for (const [chatId, state] of this.quizStates.entries()) {
            if (now - state.startTime > expireTime) {
                this.quizStates.delete(chatId);
            }
        }
    }
    
    // Handle Command - Process game commands
    async handleCommand(msg, args) {
        const chatId = msg.from;
        const userId = msg.author || msg.from;
        
        // Check if there's an active game in this chat
        const activeGame = this.gameStates.get(chatId);
        
        // If no arguments, show game menu
        if (args.length === 0) {
            return msg.reply(
                `🎮 *GAME MENU* 🎮\n\n` +
                `Gunakan perintah berikut:\n\n` +
                `*/game kuis* - Kuis pengetahuan umum\n` +
                `*/game tebakkata* - Tebak kata acak\n` +
                `*/game susunkata* - Susun kata acak\n` +
                `*/game tekateki* - Teka-teki lucu\n` +
                `*/game asahotak* - Asah otak dengan tebakan\n` +
                `*/game caklontong* - Kuis Cak Lontong\n` +
                `*/game siapakahaku* - Tebak tokoh terkenal\n` +
                `*/game math* - Tantangan matematika\n` +
                `*/game suit* - Main suit (batu/gunting/kertas)\n` +
                `*/game slot* - Putar mesin slot\n` +
                `*/game stats* - Lihat statistik game Anda\n\n` +
                `Ketik *menyerah* untuk menyerah dalam game yang sedang berjalan.`
            );
        }
        
        const subCommand = args[0].toLowerCase();
        
        // Handle surrender command
        if (subCommand === 'menyerah' || subCommand === 'surrender' || subCommand === 'give up') {
            if (!activeGame) {
                return msg.reply('❌ Tidak ada game yang sedang berjalan!');
            }
            
            const response = this.surrenderGame(chatId, activeGame, userId);
            return msg.reply(response);
        }
        
        // Handle game commands
        switch (subCommand) {
            case 'kuis':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const quizResponse = await this.startKuis(chatId);
                return msg.reply(quizResponse);
                
            case 'tebakkata':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const tebakKataResponse = await this.startTebakKata(chatId);
                return msg.reply(tebakKataResponse);
                
            case 'susunkata':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const susunKataResponse = await this.startSusunKata(chatId);
                return msg.reply(susunKataResponse);
                
            case 'tekateki':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const tekaTekiResponse = await this.startTekaTeki(chatId);
                return msg.reply(tekaTekiResponse);
                
            case 'asahotak':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const asahOtakResponse = await this.startAsahOtak(chatId);
                return msg.reply(asahOtakResponse);
                
            case 'caklontong':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const cakLontongResponse = await this.startCakLontong(chatId);
                return msg.reply(cakLontongResponse);
                
            case 'siapakahaku':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const siapaKahAkuResponse = await this.startSiapaKahAku(chatId);
                return msg.reply(siapaKahAkuResponse);
                
            case 'math':
                if (activeGame) {
                    return msg.reply('❌ Sudah ada game yang sedang berjalan! Ketik *menyerah* untuk mengakhiri.');
                }
                const mathResponse = await this.startMathGame(chatId);
                return msg.reply(mathResponse);
                
            case 'suit':
                if (args.length < 2) {
                    return msg.reply('❓ Pilih batu, gunting, atau kertas! Contoh: */game suit batu*');
                }
                const suitChoice = args[1].toLowerCase();
                if (!['batu', 'gunting', 'kertas'].includes(suitChoice)) {
                    return msg.reply('❌ Pilihan tidak valid! Pilih batu, gunting, atau kertas.');
                }
                const suitResponse = this.playSuit(suitChoice);
                return msg.reply(suitResponse);
                
            case 'slot':
                const slotResponse = this.playSlot();
                return msg.reply(slotResponse);
                
            case 'stats':
                if (!this.db) {
                    return msg.reply('❌ Statistik tidak tersedia!');
                }
                try {
                    const stats = await this.db.getUserStats(userId);
                    return msg.reply(
                        `📊 *STATISTIK GAME* 📊\n\n` +
                        `🏆 Points: ${stats.points || 0}\n` +
                        `⭐ Experience: ${stats.exp || 0}\n` +
                        `🎮 Games Played: ${stats.gamesPlayed || 0}\n` +
                        `🏅 Wins: ${stats.wins || 0}\n` +
                        `💯 Win Rate: ${stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0}%`
                    );
                } catch (error) {
                    console.error('Error getting user stats:', error);
                    return msg.reply('❌ Gagal mendapatkan statistik!');
                }
                
            default:
                return msg.reply(
                    `❌ Game tidak dikenali!\n\n` +
                    `Gunakan */game* untuk melihat daftar game yang tersedia.`
                );
        }
    }
}

module.exports = GamesHandler;