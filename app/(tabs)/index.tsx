import { router } from 'expo-router';
import * as SQLite from 'expo-sqlite';
import { FFmpegKit, FFmpegKitConfig } from "ffmpeg-kit-react-native";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
interface Video {
  id: number;
  title: string;
  description: string;
  source: string;
}
export default function Home() {
  const [data, setData] = useState<Video[]>([]);
  useEffect(() => {

    selectVideos()

  }, [])

  const selectVideos = async () => {

    
    try {
      const db = await SQLite.openDatabaseAsync('app.db');
      const allRows = await db.getAllAsync('SELECT * FROM videos');
      for (const row of allRows) {
        console.log((row as any).id, (row as any).title, (row as any).description, (row as any).source);
      }
      setData(allRows as Video[])
    } catch (e) {
      console.log('error: ' + e)
    }

  }

  return (
    <View style={styles.container}>
      <View style={{ width: '100%', backgroundColor: '#fff', elevation: 6, justifyContent: 'center', padding: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>Videos</Text>
      </View>
      <ScrollView style={{ width: '90%', height: '90%' }}>
      {data.map((video) => (
          <TouchableOpacity key={video.id} style={{ padding: 10,backgroundColor:'#FFF',elevation:6,margin:20 }} onPress={() => {
              router.push({
                pathname: '/details',
                params: {
                  id: encodeURIComponent(video.id!),
                  title: encodeURIComponent(video.title!),
                  description: encodeURIComponent(video.description!),
                  source: encodeURIComponent(video.source!),
                },
              });
          }}>
            <Text>{video.title}</Text>
            <Text>{video.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 24, fontWeight: "bold" },
});
