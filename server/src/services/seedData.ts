import crypto from 'crypto';
import { RuntimeData } from '../types/schema.js';
import { hashPassword } from '../utils/passwordHasher.js';

export async function createInitialSeedData(): Promise<RuntimeData> {
  const adminHash = await hashPassword('Director@MYbomma#Ultra2026!');
  const memberHash = await hashPassword('Rohan#Member$Cinema2026!');

  const now = new Date().toISOString();
  const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const adminId = crypto.randomUUID();
  const memberId = crypto.randomUUID();

  const planBasicId = crypto.randomUUID();
  const planPremiumId = crypto.randomUUID();
  const planUltraId = crypto.randomUUID();

  const movieIds = Array.from({ length: 10 }, () => crypto.randomUUID());
  const subscriptionId = crypto.randomUUID();
  const transactionId = `TXN-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
  const sessionId = crypto.randomUUID();

  return {
    users: [
      {
        id: adminId,
        name: 'MYbomma Director',
        email: 'admin@mybomma.com',
        passwordHash: adminHash,
        role: 'admin',
        status: 'active',
        phone: '+91 9988776655',
        subscription: {
          planId: planUltraId,
          status: 'active',
          startDate: '2026-01-01T00:00:00.000Z',
          expiresAt: '2030-01-01T00:00:00.000Z'
        },
        preferences: {
          defaultAudio: 'Hindi / Original',
          autoPlayNext: true
        },
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: memberId,
        name: 'Rohan Verma',
        email: 'rohan@mybomma.com',
        passwordHash: memberHash,
        role: 'member',
        status: 'active',
        phone: '+91 9876543210',
        subscription: {
          planId: planPremiumId,
          status: 'active',
          startDate: now,
          expiresAt: thirtyDaysLater
        },
        preferences: {
          defaultAudio: 'Hindi / Original',
          autoPlayNext: true
        },
        createdAt: now
      }
    ],
    plans: [
      {
        id: planBasicId,
        name: 'Standard Mobile',
        price: 19900,
        currency: 'INR',
        resolution: '720p HD',
        screens: 1,
        validityDays: 30
      },
      {
        id: planPremiumId,
        name: 'Super Cinema',
        price: 49900,
        currency: 'INR',
        resolution: '1080p Full HD',
        screens: 2,
        validityDays: 30
      },
      {
        id: planUltraId,
        name: 'MYbomma IMAX 4K',
        price: 79900,
        currency: 'INR',
        resolution: '4K Ultra HD + Dolby Atmos',
        screens: 4,
        validityDays: 30
      }
    ],
    movies: [
      {
        id: movieIds[0],
        title: 'Jawan',
        description: 'A prison warden recruits inmates to commit outrageous crimes that unveil corruption and injustice in society while reconnecting with his long-lost father.',
        releaseYear: 2023,
        duration: '2h 49m',
        rating: 'U/A 16+',
        imdbRating: 7.0,
        genres: ['Action', 'Thriller', 'Drama'],
        cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Deepika Padukone'],
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        requiredTier: 'Super Cinema',
        isFeatured: true,
        isPublished: true,
        views: 890400,
        createdAt: '2026-01-10T00:00:00.000Z'
      },
      {
        id: movieIds[1],
        title: 'RRR (Rise Roar Revolt)',
        description: 'A fearless revolutionary and an officer in the British force join hands to chart an intrepid path towards freedom.',
        releaseYear: 2022,
        duration: '3h 7m',
        rating: 'U/A 16+',
        imdbRating: 7.8,
        genres: ['Action', 'Drama', 'Period'],
        cast: ['N.T.R Jr.', 'Ram Charan', 'Alia Bhatt', 'Ajay Devgn'],
        posterUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        requiredTier: 'Basic',
        isFeatured: true,
        isPublished: true,
        views: 754100,
        createdAt: '2026-01-15T00:00:00.000Z'
      },
      {
        id: movieIds[2],
        title: '12th Fail',
        description: 'Based on the real-life story of IPS Officer Manoj Kumar Sharma, who fearlessly restarts his academic journey despite extreme poverty and obstacles.',
        releaseYear: 2023,
        duration: '2h 27m',
        rating: 'U/A',
        imdbRating: 8.9,
        genres: ['Biography', 'Drama', 'Inspirational'],
        cast: ['Vikrant Massey', 'Medha Shankr', 'Anant V Joshi'],
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        requiredTier: 'Basic',
        isFeatured: false,
        isPublished: true,
        views: 620500,
        createdAt: '2026-01-22T00:00:00.000Z'
      },
      {
        id: movieIds[3],
        title: 'Kalki 2898 AD',
        description: 'A modern avatar of the Hindu god Vishnu, believed to have descended to the earth to protect the world from evil forces in a dystopian post-apocalyptic future.',
        releaseYear: 2024,
        duration: '3h 1m',
        rating: 'U/A 16+',
        imdbRating: 7.6,
        genres: ['Action', 'Sci-Fi', 'Fantasy'],
        cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
        posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        requiredTier: 'IMAX 4K',
        isFeatured: true,
        isPublished: true,
        views: 942100,
        createdAt: '2026-02-01T00:00:00.000Z'
      },
      {
        id: movieIds[4],
        title: 'Kantara: A Legend',
        description: 'When greed paves the way for betrayal, scheming and murder, a young tribal man reluctantly dons the sacred traditions of his ancestors to seek justice.',
        releaseYear: 2022,
        duration: '2h 28m',
        rating: 'U/A 16+',
        imdbRating: 8.3,
        genres: ['Action', 'Drama', 'Folklore'],
        cast: ['Rishab Shetty', 'Sapthami Gowda', 'Kishore Kumar G.'],
        posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        requiredTier: 'Basic',
        isFeatured: false,
        isPublished: true,
        views: 512500,
        createdAt: '2026-02-10T00:00:00.000Z'
      },
      {
        id: movieIds[5],
        title: 'Dangal',
        description: 'Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression.',
        releaseYear: 2016,
        duration: '2h 41m',
        rating: 'U',
        imdbRating: 8.4,
        genres: ['Action', 'Biography', 'Sports'],
        cast: ['Aamir Khan', 'Fatima Sana Shaikh', 'Sanya Malhotra', 'Zaira Wasim'],
        posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4',
        requiredTier: 'Super Cinema',
        isFeatured: false,
        isPublished: true,
        views: 815000,
        createdAt: '2026-02-15T00:00:00.000Z'
      },
      {
        id: movieIds[6],
        title: 'Pushpa 2: The Rule',
        description: 'Pushpa Raj expands his syndicates across national borders while fighting off dynamic political factions and ruthless enforcement.',
        releaseYear: 2024,
        duration: '3h 20m',
        rating: 'A',
        imdbRating: 8.0,
        genres: ['Action', 'Crime', 'Thriller'],
        cast: ['Allu Arjun', 'Fahadh Faasil', 'Rashmika Mandanna'],
        posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        requiredTier: 'Super Cinema',
        isFeatured: true,
        isPublished: true,
        views: 980000,
        createdAt: '2026-03-01T00:00:00.000Z'
      },
      {
        id: movieIds[7],
        title: 'Baahubali 2: The Conclusion',
        description: 'When Shiva learns about his heritage in the Mahishmati Kingdom, he begins a perilous quest to avenge his father and claim his rightful throne.',
        releaseYear: 2017,
        duration: '2h 47m',
        rating: 'U/A 16+',
        imdbRating: 8.2,
        genres: ['Action', 'Drama', 'Fantasy'],
        cast: ['Prabhas', 'Rana Daggubati', 'Anushka Shetty', 'Sathyaraj'],
        posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        requiredTier: 'Basic',
        isFeatured: false,
        isPublished: true,
        views: 890000,
        createdAt: '2026-03-05T00:00:00.000Z'
      },
      {
        id: movieIds[8],
        title: 'Stree 2',
        description: 'After the events of Stree, the town of Chanderi is haunted by a terrifying headless entity known as Sarkata that abducts modern women.',
        releaseYear: 2024,
        duration: '2h 27m',
        rating: 'U/A 16+',
        imdbRating: 7.3,
        genres: ['Comedy', 'Horror', 'Mystery'],
        cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Abhishek Banerjee'],
        posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        requiredTier: 'Super Cinema',
        isFeatured: true,
        isPublished: true,
        views: 920000,
        createdAt: '2026-03-10T00:00:00.000Z'
      },
      {
        id: movieIds[9],
        title: 'Manjummel Boys',
        description: 'A group of close-knit friends from Kochi embark on a vacation to Kodaikanal, where an unexpected rescue mission tests the limits of human fraternity.',
        releaseYear: 2024,
        duration: '2h 15m',
        rating: 'U',
        imdbRating: 8.5,
        genres: ['Adventure', 'Drama', 'Thriller'],
        cast: ['Soubin Shahir', 'Sreenath Bhasi', 'Balu Varghese'],
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80',
        backdropUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=1600&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        requiredTier: 'IMAX 4K',
        isFeatured: false,
        isPublished: true,
        views: 670000,
        createdAt: '2026-03-15T00:00:00.000Z'
      }
    ],
    subscriptions: [
      {
        id: subscriptionId,
        userId: memberId,
        planId: planPremiumId,
        amount: 49900,
        currency: 'INR',
        paymentMethod: 'Credit / Debit Card (Visa Ending in 4242)',
        transactionId: transactionId,
        status: 'completed',
        createdAt: now
      }
    ],
    watchlists: [
      {
        userId: memberId,
        movieId: movieIds[0],
        addedAt: now,
        progressSeconds: 1420,
        completed: false,
        notes: 'High-octane action cinema recommendation'
      }
    ],
    sessions: [
      {
        id: sessionId,
        userId: memberId,
        createdAt: now,
        loginTimestamp: now,
        expiresAt: thirtyDaysLater
      }
    ],
    metadata: {
      platform: 'MYbomma',
      version: '2.0.0',
      region: 'IN',
      streamingStatus: 'operational'
    }
  };
}
