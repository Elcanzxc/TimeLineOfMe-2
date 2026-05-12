import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Loader2, TrendingUp, Clock, BookOpen, Gamepad2, Film, Music } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

export function StatsPage() {
  const { t } = useTranslation();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['myStats'],
    queryFn: async () => {
      const res = await apiClient.get('/api/stats/me');
      return res.data;
    }
  });

  if (isLoading) {
    return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  if (!stats) return <div className="text-center p-10">No stats found</div>;

  const typeData = [
    { name: t('search.tabs.movies'), value: stats.moviesCompleted || 0, icon: <Film className="w-5 h-5"/>, color: '#3b82f6' },
    { name: t('search.tabs.books'), value: stats.booksCompleted || 0, icon: <BookOpen className="w-5 h-5"/>, color: '#10b981' },
    { name: t('search.tabs.games'), value: stats.gamesCompleted || 0, icon: <Gamepad2 className="w-5 h-5"/>, color: '#f59e0b' },
    { name: t('search.tabs.music'), value: stats.musicCompleted || 0, icon: <Music className="w-5 h-5"/>, color: '#ec4899' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-extrabold tracking-tight">{t('stats.title')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {typeData.map((item) => (
          <Card key={item.name}>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div style={{ color: item.color }} className="mb-2">{item.icon}</div>
              <p className="text-sm text-muted-foreground">{item.name} {t('stats.completed')}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>{t('stats.content_by_type')}</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('stats.top_genres')}</CardTitle>
          </CardHeader>
          <CardContent className="h-80 flex items-center justify-center">
            {stats.topGenres && stats.topGenres.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topGenres.map((g: any) => ({ name: g.name, count: g.count }))} layout="vertical">
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground">{t('stats.not_enough_data')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {stats.totalTimeSpent > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 flex items-center gap-6">
            <Clock className="w-12 h-12 text-primary" />
            <div>
              <h3 className="text-2xl font-bold">{t('stats.total_time')}</h3>
              <p className="text-muted-foreground">{t('stats.time_spent', { hours: stats.totalTimeSpent })}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
