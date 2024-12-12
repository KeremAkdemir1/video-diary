import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as SQLite from 'expo-sqlite';

export default function DetailsScreen() {
    const searchParams = useSearchParams();
    const id = decodeURIComponent(searchParams.get('id') || '');
    const titleParam = decodeURIComponent(searchParams.get('title') || '');
    const descriptionParam = decodeURIComponent(searchParams.get('description') || '');
    const sourceParam = decodeURIComponent(searchParams.get('source') || '');

    const [title, setTitle] = useState(titleParam)
    const [description, setDescription] = useState(descriptionParam)
    const [source, setSource] = useState(sourceParam)
    const player = useVideoPlayer(source, (player) => {
        player.loop = false;
        player.currentTime = 0;
    });
    useEffect(() => {

        console.log(searchParams.get('source'))
    }, [])

    const updateVideo = async () => {
        try {
            const db = SQLite.openDatabaseAsync('app.db');
            const result = (await db).runAsync('UPDATE videos SET title = ?, description = ?, source = ?  WHERE id = ?', title, description, source, id);
            return (await result).lastInsertRowId
        } catch (e) {
            console.log('error: ' + e)
        }

    };
    const handleSave = async () => {
        console.log("Kaydet butonuna basıldı", { title, description, source });

        try {
            // Yeni veri ekliyoruz
            const result = await updateVideo();
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
                    <Text style={styles.buttonText}>Güncelle</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
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
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});
