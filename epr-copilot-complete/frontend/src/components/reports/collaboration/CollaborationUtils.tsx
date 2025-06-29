
export const getStatusColor = (status: string) => {
  switch (status) {
    case 'In Progress':
      return 'bg-blue-100 text-blue-800';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800';
    case 'Completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getRoleColor = (role: string) => {
  switch (role) {
    case 'Editor':
      return 'bg-purple-100 text-purple-800';
    case 'Reviewer':
      return 'bg-orange-100 text-orange-800';
    case 'Viewer':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const mockCollaborations = [
  {
    id: '1',
    reportId: 'Q3-2024',
    reportName: 'Q3 2024 Compliance Report',
    status: 'In Progress',
    owner: 'Sarah Johnson',
    collaborators: [
      { name: 'Mike Chen', avatar: '', role: 'Reviewer', lastActive: '2 minutes ago' },
      { name: 'Lisa Park', avatar: '', role: 'Editor', lastActive: '1 hour ago' },
      { name: 'Tom Wilson', avatar: '', role: 'Viewer', lastActive: '3 hours ago' }
    ],
    comments: 12,
    changes: 8,
    lastModified: '2024-01-22T10:30:00Z'
  },
  {
    id: '2',
    reportId: 'Q2-2024',
    reportName: 'Q2 2024 Compliance Report',
    status: 'Under Review',
    owner: 'Mike Chen',
    collaborators: [
      { name: 'Sarah Johnson', avatar: '', role: 'Reviewer', lastActive: '5 minutes ago' },
      { name: 'David Brown', avatar: '', role: 'Viewer', lastActive: '2 days ago' }
    ],
    comments: 5,
    changes: 3,
    lastModified: '2024-01-21T14:15:00Z'
  }
];
