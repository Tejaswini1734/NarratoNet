import { storage } from "./storage";
import { STORY_GENRES } from "./models";

// Sample data for development and testing
export async function seedData() {
  try {
    // Create sample users
    const user1 = await storage.createUser({
      username: "storyteller_jane",
      email: "jane@example.com",
      password: "hashed_password_123",
      displayName: "Jane the Storyteller",
      bio: "Passionate writer of fantasy and mystery stories",
      avatar: null
    });

    const user2 = await storage.createUser({
      username: "adventure_mike",
      email: "mike@example.com", 
      password: "hashed_password_456",
      displayName: "Adventure Mike",
      bio: "Love writing action-packed adventures",
      avatar: null
    });

    const user3 = await storage.createUser({
      username: "romantic_sarah",
      email: "sarah@example.com",
      password: "hashed_password_789", 
      displayName: "Sarah Romance",
      bio: "Writing heartwarming romance stories",
      avatar: null
    });

    // Create sample stories
    const story1 = await storage.createStory({
      title: "The Magical Forest",
      content: "In a land far away, there existed a magical forest where ancient trees whispered secrets to those brave enough to listen. Emma, a young botanist, discovered this forest during her research expedition. As she ventured deeper into the woodland, she realized that the trees were not just alive—they were guardians of ancient wisdom that could change the world. Each step she took revealed new mysteries, and with every mystery solved, she grew stronger and more determined to protect this sacred place. The forest tested her courage, her intellect, and her heart, but Emma was ready for the challenge that would define her destiny.",
      excerpt: "A young botanist discovers a magical forest where trees hold ancient secrets...",
      genre: "Fantasy",
      coverImage: null,
      readTime: 8,
      authorId: user1.id
    });

    const story2 = await storage.createStory({
      title: "The Lost Treasure of Captain Blackbeard",
      content: "Captain Jake Morrison never believed in pirates' tales until he found an ancient map in his grandfather's attic. The map led to the legendary treasure of Captain Blackbeard, hidden somewhere in the Caribbean. Armed with modern technology and an adventurous spirit, Jake assembled a team of explorers to embark on the journey of a lifetime. They faced treacherous waters, rival treasure hunters, and supernatural guardians protecting the treasure. But Jake's determination and his grandfather's wisdom guided him through every challenge. The treasure was more than gold—it was a legacy that connected him to his family's seafaring past.",
      excerpt: "A modern treasure hunter follows an ancient map to find Captain Blackbeard's lost treasure...",
      genre: "Adventure", 
      coverImage: null,
      readTime: 12,
      authorId: user2.id
    });

    const story3 = await storage.createStory({
      title: "Love in the Time of Coffee",
      content: "Elena ran a small coffee shop in the heart of the city, serving the perfect cup to anyone who needed comfort. When Marcus, a travel photographer, stumbled into her shop during a rainstorm, neither expected that a simple conversation over coffee would change their lives forever. As Marcus extended his stay in the city, their daily coffee meetings became the highlight of both their days. They shared stories of dreams, fears, and hopes while the aroma of freshly ground coffee beans filled the air. But when Marcus received an offer for his dream assignment overseas, they had to decide if their love was strong enough to bridge any distance.",
      excerpt: "A coffee shop owner and a travel photographer discover love over daily coffee conversations...",
      genre: "Romance",
      coverImage: null,
      readTime: 6,
      authorId: user3.id
    });

    const story4 = await storage.createStory({
      title: "The Mystery of the Midnight Library",
      content: "Librarian Dr. Amanda Foster noticed something strange happening in her university library. Books were being rearranged every night, and ancient texts were appearing in places they shouldn't be. When she decided to stay overnight to investigate, she discovered that the library transformed into a gateway to different worlds after midnight. Each book became a portal to its story's universe, and Amanda found herself becoming the guardian of these literary dimensions. She had to solve the mystery of who was manipulating these portals and why, before the boundaries between fiction and reality collapsed completely.",
      excerpt: "A librarian discovers her library becomes a gateway to story worlds after midnight...", 
      genre: "Mystery",
      coverImage: null,
      readTime: 10,
      authorId: user1.id
    });

    // Create some follows
    await storage.createFollow(user2.id, user1.id); // Mike follows Jane
    await storage.createFollow(user3.id, user1.id); // Sarah follows Jane
    await storage.createFollow(user1.id, user2.id); // Jane follows Mike

    // Create some likes
    await storage.createLike(story1.id, user2.id); // Mike likes Jane's fantasy story
    await storage.createLike(story1.id, user3.id); // Sarah likes Jane's fantasy story
    await storage.createLike(story2.id, user1.id); // Jane likes Mike's adventure story
    await storage.createLike(story3.id, user1.id); // Jane likes Sarah's romance story

    // Create some comments
    await storage.createComment({
      content: "Amazing world-building! I felt like I was walking through the forest myself.",
      storyId: story1.id,
      authorId: user2.id
    });

    await storage.createComment({
      content: "Such a thrilling adventure! Can't wait to read more of your stories.",
      storyId: story2.id, 
      authorId: user3.id
    });

    await storage.createComment({
      content: "This made me want to visit my local coffee shop immediately. Beautiful story!",
      storyId: story3.id,
      authorId: user1.id
    });

    // Create some notifications
    await storage.createNotification({
      type: "like",
      userId: user1.id,
      fromUserId: user2.id,
      storyId: story1.id
    });

    await storage.createNotification({
      type: "comment", 
      userId: user2.id,
      fromUserId: user3.id,
      storyId: story2.id
    });

    await storage.createNotification({
      type: "follow",
      userId: user1.id,
      fromUserId: user2.id
    });

    console.log("Sample data created successfully!");
    console.log(`Created ${await storage.getAllStories(100, 0).then(s => s.length)} stories`);
    
  } catch (error) {
    console.error("Error creating sample data:", error);
  }
}

// Function to check if data already exists
export async function shouldSeedData(): Promise<boolean> {
  const stories = await storage.getAllStories(1, 0);
  return stories.length === 0;
}