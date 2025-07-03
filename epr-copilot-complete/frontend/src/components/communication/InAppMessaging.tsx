
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Plus, Users, Hash } from 'lucide-react';
import { messagingService } from '@/services/messagingService';
import { Message, Channel } from '@/types/communication';

export const InAppMessaging = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadChannels();
    loadMessages(activeChannel);
  }, [activeChannel]);

  const loadChannels = () => {
    const channelData = messagingService.getChannels();
    setChannels(channelData);
  };

  const loadMessages = (channelId: string) => {
    const messageData = messagingService.getMessages(channelId);
    setMessages(messageData);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await messagingService.sendMessage({
        senderId: 'current-user',
        senderName: 'Current User',
        channelId: activeChannel,
        content: newMessage,
        type: 'text',
        reactions: []
      });

      setNewMessage('');
      loadMessages(activeChannel);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getChannelIcon = (type: Channel['type']) => {
    switch (type) {
      case 'public':
        return <Hash className="h-4 w-4" />;
      case 'private':
        return <Users className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const activeChannelData = channels.find(c => c.id === activeChannel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      {/* Channel List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Channels</CardTitle>
            <Button size="sm" variant="outline" onClick={async () => {
              try {
                const channelName = prompt('Enter channel name:');
                if (!channelName) return;
                
                const channelType = confirm('Make this a private channel?') ? 'private' : 'public';
                
                const newChannel = await messagingService.createChannel({
                  name: channelName,
                  type: channelType,
                  description: `${channelType} channel for ${channelName}`,
                  members: [{
                    userId: 'current-user',
                    userName: 'Current User',
                    role: 'admin',
                    joinedAt: new Date().toISOString(),
                    isOnline: true,
                    lastSeen: new Date().toISOString()
                  }],
                  createdBy: 'current-user',
                  isArchived: false
                });
                
                if (newChannel) {
                  loadChannels();
                  setActiveChannel(newChannel.id);
                }
              } catch (error) {
                console.error('Failed to create channel:', error);
                alert('Failed to create channel. Please try again.');
              }
            }}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="space-y-1 p-4">
              {channels.map((channel) => (
                <Button
                  key={channel.id}
                  variant={activeChannel === channel.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveChannel(channel.id)}
                >
                  {getChannelIcon(channel.type)}
                  <span className="ml-2">{channel.name}</span>
                  {messagingService.getUnreadCount(channel.id) > 0 && (
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {messagingService.getUnreadCount(channel.id)}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                {activeChannelData && getChannelIcon(activeChannelData.type)}
                <span className="ml-2">{activeChannelData?.name}</span>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {activeChannelData?.members.length} members
              </p>
            </div>
            <Badge variant="outline">
              {activeChannelData?.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <ScrollArea className="h-[400px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-sm">{message.senderName}</span>
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm mt-1">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 min-h-[40px] max-h-[120px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
