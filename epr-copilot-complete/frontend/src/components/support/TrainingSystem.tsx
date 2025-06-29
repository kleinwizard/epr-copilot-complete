
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supportService } from '@/services/supportService';
import { TrainingModule, TrainingLesson } from '@/types/support';
import { Play, Clock, CheckCircle, BookOpen, Video, FileText, Zap } from 'lucide-react';

export const TrainingSystem = () => {
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<TrainingLesson | null>(null);

  useEffect(() => {
    loadTrainingModules();
  }, []);

  const loadTrainingModules = async () => {
    const modulesData = await supportService.getTrainingModules();
    setModules(modulesData);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'interactive': return <Zap className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (selectedLesson) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedLesson(null)}>
            ← Back to Module
          </Button>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            {getLessonIcon(selectedLesson.type)}
            <span>{selectedLesson.type}</span>
            <Clock className="h-4 w-4 ml-4" />
            <span>{selectedLesson.duration} min</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {selectedLesson.title}
              {selectedLesson.completed && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {selectedLesson.type === 'video' && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Video content would be embedded here</p>
                  </div>
                </div>
              )}
              
              <div className="prose max-w-none">
                <p>{selectedLesson.content}</p>
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <Button variant="outline">
                  Previous Lesson
                </Button>
                <Button>
                  {selectedLesson.completed ? 'Mark Complete' : 'Complete & Continue'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedModule) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => setSelectedModule(null)}>
            ← Back to Modules
          </Button>
          <Badge className={getLevelColor(selectedModule.level)}>
            {selectedModule.level}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{selectedModule.title}</CardTitle>
            <CardDescription>{selectedModule.description}</CardDescription>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {selectedModule.duration} minutes
              </div>
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 mr-1" />
                {selectedModule.lessons.length} lessons
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{selectedModule.progress}%</span>
                </div>
                <Progress value={selectedModule.progress} className="h-2" />
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Lessons</h4>
                {selectedModule.lessons.map((lesson, index) => (
                  <Card 
                    key={lesson.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedLesson(lesson)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                            {lesson.completed ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <h5 className="font-medium">{lesson.title}</h5>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center">
                                {getLessonIcon(lesson.type)}
                                <span className="ml-1 capitalize">{lesson.type}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {lesson.duration} min
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {lesson.completed ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Training Modules</CardTitle>
          <CardDescription>Enhance your EPR compliance knowledge with our comprehensive training program</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map(module => (
          <Card key={module.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedModule(module)}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <Badge className={getLevelColor(module.level)}>
                  {module.level}
                </Badge>
              </div>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {module.duration} minutes
                  </div>
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    {module.lessons.length} lessons
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>

                <Button className="w-full">
                  {module.progress > 0 ? 'Continue' : 'Start Module'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
