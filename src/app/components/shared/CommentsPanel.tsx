import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { MessageSquare, Send } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  role: string;
  timestamp: string;
  content: string;
  visibility: 'internal' | 'shared_with_student' | 'all_actors';
}

interface CommentsPanelProps {
  applicationId: string;
  currentUserRole: string;
  comments?: Comment[];
  onAddComment?: (content: string, visibility: string) => void;
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    author: 'Mehmet Demir',
    role: 'ÖİDB',
    timestamp: '11/01/2025 09:15',
    content: 'Tüm belgeler doğrulandı. Başvuru dil incelemesi için YDYO\'ya iletildi.',
    visibility: 'all_actors'
  },
  {
    id: '2',
    author: 'Ayşe Kaya',
    role: 'YDYO',
    timestamp: '12/01/2025 10:30',
    content: 'TOEFL puanı doğrulandı. Öğrenci dil gereksinimlerini karşılıyor.',
    visibility: 'all_actors'
  },
  {
    id: '3',
    author: 'Fatma Şahin',
    role: 'YGK',
    timestamp: '14/01/2025 14:20',
    content: 'Dahili not: Öğrencinin akademik geçmişi güçlü. Önceki dersleri müfredatımızla iyi örtüşüyor.',
    visibility: 'internal'
  }
];

export function CommentsPanel({ 
  applicationId, 
  currentUserRole,
  comments = MOCK_COMMENTS,
  onAddComment 
}: CommentsPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [visibility, setVisibility] = useState<'internal' | 'shared_with_student' | 'all_actors'>('all_actors');

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment, visibility);
      setNewComment('');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-2 mb-4">
        <MessageSquare className="w-5 h-5" style={{ color: '#C00000' }} />
        <h3 className="text-gray-900 font-bold">Yorumlar ve Notlar</h3>
        <Badge variant="outline" className="text-xs font-mono">{comments.length}</Badge>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900">{comment.author}</span>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">{comment.role}</Badge>
                </div>
                <div className="text-[10px] text-gray-400 font-medium mt-0.5">{comment.timestamp}</div>
              </div>
              {comment.visibility === 'internal' && (
                <Badge className="bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase border-yellow-200">Sadece Dahili</Badge>
              )}
              {comment.visibility === 'shared_with_student' && (
                <Badge className="bg-blue-100 text-blue-800 text-[10px] font-bold uppercase border-blue-200">Öğrenciye Açık</Badge>
              )}
            </div>
            <div className="text-sm text-gray-700 leading-relaxed">{comment.content}</div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <div className="text-sm font-bold text-gray-900">Yorum Ekle</div>
        <Textarea
          rows={3}
          placeholder="Yorumunuzu veya notunuzu buraya giriniz..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="resize-none"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase">Görünürlük:</span>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="text-xs border border-gray-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-[#C00000]"
            >
              <option value="all_actors">Tüm Görevliler</option>
              <option value="shared_with_student">Öğrenciye Açık</option>
              <option value="internal">Sadece Birim İçi (Dahili)</option>
            </select>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!newComment.trim()}
            style={{ backgroundColor: '#C00000' }}
            className="shadow-sm"
          >
            <Send className="w-4 h-4 mr-2" />
            Gönder
          </Button>
        </div>
      </div>
    </Card>
  );
}
