import type { Course } from '@/types/course.types';

import Link from 'next/link';
import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Button } from '../ui/button';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const instructor = typeof course.instructor === 'object' ? course.instructor : null;
  const instructorName = instructor?.name || 'Unknown Instructor';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-lg">
      {course.thumbnail && (
        <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
          <Image alt={course.title} className="object-cover" fill src={course.thumbnail} />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {formatPrice(course.price)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{course.category}</Badge>
          {course.tags?.slice(0, 2).map(tag => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-sm text-muted-foreground">
          <p>Instructor: {instructorName}</p>
          {course.duration && <p>Duration: {formatDuration(course.duration)}</p>}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" variant="default">
          <Link href={`/courses/${course._id}`}>View Course</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
