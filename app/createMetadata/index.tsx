import { useSearchParams } from "expo-router/build/hooks";
import { useVideoPlayer, VideoView } from "expo-video";
import React from "react";
import { StyleSheet, TextInput, Text, View, TouchableOpacity } from "react-native";
import * as SQLite from 'expo-sqlite';
import { router } from "expo-router";
import * as FileSystem from 'expo-file-system';

// Veritabanı bağlantısını oluşturuyoruz

export default function index() {
    const searchParams = useSearchParams();
    const uri = decodeURIComponent(searchParams.get('uri') || '');
    const [title, setTitle] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [source, setSource] = React.useState(uri);
    const player = useVideoPlayer(source, (player) => {
        player.loop = false;
        player.currentTime = 0;
    });
    React.useEffect(() => {
      
        initDB()
        changeSourceFile()
    }, [])
    const generateRandomFileName = () => {
        const randomValue = Math.random().toString(36).substr(2, 15); // 9 karakterlik rastgele bir değer
        return randomValue;
      };
    const changeSourceFile = async () => {
        const permanentUri = await moveToPermanentStorage(uri);
        if (permanentUri) {
          setSource(permanentUri);
        }
    }
      const moveToPermanentStorage = async (uri:any) => {
        try {
            const fileExtension = uri.split('.').pop(); // Dosya uzantısını al
            const fileName = generateRandomFileName() + '.' + fileExtension; // Rastgele isim ve uzantıyı birleştir
            const newUri = FileSystem.documentDirectory + fileName;
      
          // Dosyayı uygulama dizinine kopyala
          await FileSystem.copyAsync({
            from: uri,
            to: newUri,
          });
          
          console.log(`Dosya başarıyla kopyalandı: ${newUri}`);
          return newUri;
        } catch (error) {
          console.error('Dosya kopyalama hatası:', error);
          return null;
        }
      };
    const initDB = async () => {
        try {
            const db = SQLite.openDatabaseAsync('app.db');
            (await db).execAsync(`CREATE TABLE IF NOT EXISTS videos (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, description TEXT, source TEXT);`);
        } catch (e) {
            console.log('error: ' + e)
        }
    }
    const insertVideo = async () => {
        try {
            const db = SQLite.openDatabaseAsync('app.db');
            const result = (await db).runAsync('INSERT INTO videos (title, description, source) VALUES (?, ?, ?)', title, description, source);
            return (await result).lastInsertRowId
        } catch (e) {
            console.log('error: ' + e)
        }

    };
    // Veritabanı işlemlerini async/await ile yönetmek için
    const handleSave = async () => {
        console.log("Kaydet butonuna basıldı", { title, description, source });

        try {
            // Yeni veri ekliyoruz
            const result = await insertVideo();
            console.log("Veri kaydedildi");
              router.push({
                pathname: '/(tabs)',
              });

            alert('Veri başarıyla kaydedildi!');
        } catch (error) {
            console.log("Veri kaydedilirken hata oluştu:", error);
            alert('Veri kaydedilirken bir hata oluştu.');
        }
    };

    

    const handleCancel = () => {
        router.push({
            pathname: '/(tabs)',
          });
    };


    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Başlık</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Başlık"
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Açıklama"
                    value={description}
                    onChangeText={setDescription}
                    multiline={true}
                    numberOfLines={4}
                />
            </View>

            <View style={styles.videoContainer}>
                <VideoView style={styles.video} player={player} nativeControls={true} />
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.successButton} onPress={handleSave}>
                    <Text style={styles.buttonText}>Kaydet</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        color: '#000',
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        color: '#000',
    },
    textArea: {
        height: 100, // TextArea'nın yüksekliğini arttırabiliriz
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    video: {
        width: '100%',
        height: '60%',
        backgroundColor: '#000',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    cancelButton: {
        backgroundColor: '#FF0606',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    successButton: {
        backgroundColor: '#67C5B5',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    fetchButton: {
        backgroundColor: '#FFCA28',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
