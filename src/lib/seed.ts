import { join } from 'path';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';

import connectDB from '@/lib/db';

import User from '@/models/User';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: 'admin';
}

interface SeedLesson {
  title: string;
  description?: string;
  videoUrl?: string;
  duration: number;
  order: number;
  isPreview?: boolean;
}

interface SeedCourse {
  title: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  duration: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  thumbnail?: string;
  isPublished: boolean;
  instructorEmail: string;
  lessons?: SeedLesson[];
}

interface SeedData {
  users: SeedUser[];
  courses: SeedCourse[];
}

export async function seedDatabase(): Promise<{
  usersCreated: number;
  coursesCreated: number;
  lessonsCreated: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let usersCreated = 0;
  let coursesCreated = 0;
  let lessonsCreated = 0;

  try {
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');

    // Read seed data file
    const seedDataPath = join(process.cwd(), 'data', 'seed-data.json');
    const seedDataContent = readFileSync(seedDataPath, 'utf-8');
    const seedData: SeedData = JSON.parse(seedDataContent);

    console.log(
      `📊 Found ${seedData.users.length} users and ${seedData.courses.length} courses to seed`
    );

    // Create users
    console.log('\n👥 Creating users...');
    const userMap = new Map<string, string>(); // email -> userId

    for (const userData of seedData.users) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
          console.log(`⏭️  User ${userData.email} already exists, skipping...`);
          userMap.set(userData.email, existingUser._id.toString());
          continue;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // Create user
        const user = new User({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
        });

        await user.save();
        userMap.set(userData.email, user._id.toString());
        usersCreated++;
        console.log(`✅ Created user: ${userData.name} (${userData.email})`);
      } catch (error) {
        const errorMessage = `Failed to create user ${userData.email}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    // Create courses
    console.log('\n📚 Creating courses...');
    for (const courseData of seedData.courses) {
      try {
        // Get instructor ID
        const instructorId = userMap.get(courseData.instructorEmail);
        if (!instructorId) {
          const errorMessage = `Instructor ${courseData.instructorEmail} not found for course ${courseData.title}`;
          console.error(`❌ ${errorMessage}`);
          errors.push(errorMessage);
          continue;
        }

        // Check if course already exists
        const existingCourse = await Course.findOne({ title: courseData.title });
        if (existingCourse) {
          console.log(`⏭️  Course "${courseData.title}" already exists, skipping...`);
          continue;
        }

        // Create course
        const course = new Course({
          title: courseData.title,
          description: courseData.description,
          price: courseData.price,
          category: courseData.category,
          tags: courseData.tags,
          duration: courseData.duration,
          level: courseData.level,
          language: courseData.language,
          thumbnail: courseData.thumbnail,
          isPublished: courseData.isPublished,
          instructor: instructorId,
        });

        await course.save();
        coursesCreated++;
        console.log(`✅ Created course: ${courseData.title}`);

        // Create lessons for this course
        if (courseData.lessons && courseData.lessons.length > 0) {
          console.log(`   📝 Creating ${courseData.lessons.length} lessons...`);
          for (const lessonData of courseData.lessons) {
            try {
              const lesson = new Lesson({
                course: course._id,
                title: lessonData.title,
                description: lessonData.description || '',
                videoUrl: lessonData.videoUrl,
                duration: lessonData.duration,
                order: lessonData.order,
                isPreview: lessonData.isPreview || false,
              });

              await lesson.save();
              lessonsCreated++;
            } catch (error) {
              const errorMessage = `Failed to create lesson "${lessonData.title}" for course "${courseData.title}": ${error instanceof Error ? error.message : 'Unknown error'}`;
              console.error(`   ❌ ${errorMessage}`);
              errors.push(errorMessage);
            }
          }
        }
      } catch (error) {
        const errorMessage = `Failed to create course ${courseData.title}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMessage}`);
        errors.push(errorMessage);
      }
    }

    console.log('\n✨ Seeding completed!');
    console.log(`📊 Summary:`);
    console.log(`   - Users created: ${usersCreated}`);
    console.log(`   - Courses created: ${coursesCreated}`);
    console.log(`   - Lessons created: ${lessonsCreated}`);
    if (errors.length > 0) {
      console.log(`   - Errors: ${errors.length}`);
    }

    return {
      usersCreated,
      coursesCreated,
      lessonsCreated,
      errors,
    };
  } catch (error) {
    const errorMessage = `Seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMessage}`);
    errors.push(errorMessage);
    throw error;
  }
}
