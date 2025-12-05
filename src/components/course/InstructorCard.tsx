import type { Instructor } from '@/types/course.types';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface InstructorCardProps {
  instructor: Instructor;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="font-semibold">{instructor.name}</p>
          {instructor.email && <p className="text-sm text-muted-foreground">{instructor.email}</p>}
          {instructor.bio && <p className="text-sm text-muted-foreground">{instructor.bio}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
