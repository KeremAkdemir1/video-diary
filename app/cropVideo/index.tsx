import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, TouchableOpacity } from 'react-native';
import * as React from 'react';
import { FFmpegKit, FFmpegKitConfig, ReturnCode } from 'ffmpeg-kit-react-native';
import { makeDirectoryAsync, getInfoAsync, cacheDirectory } from 'expo-file-system';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { useMutation } from '@tanstack/react-query'; // Import Tanstack Query
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { router } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSearchParams } from 'expo-router/build/hooks';

const getResultPath = async () => {
  const videoDir = `${cacheDirectory}video/`;
  const ensureDirExists = async () => {
    const dirInfo = await getInfoAsync(videoDir);
    if (!dirInfo.exists) {
      console.log("tmp directory doesn't exist, creating...");
      await makeDirectoryAsync(videoDir, { intermediates: true });
    }
  };
  await ensureDirExists();
  return `${videoDir}file2.mp4`;
};

const requestPermission = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission to access media is required');
  }
};


const trimVideoFn = async (sourceVideo: string, multiSliderValue: number[]): Promise<string> => {
  const resultVideo = await getResultPath();
  if (!sourceVideo) {
    throw new Error('No video source provided');
  }

  console.log('Source video path:', sourceVideo);
  console.log('Result video path:', resultVideo);

  const sourcePath = sourceVideo.replace('file://', '');
  const resultPath = resultVideo.replace('file://', '');
  console.log(multiSliderValue)
  const ffmpegCommand = `-ss ${multiSliderValue[0]} -i ${sourcePath} -t 5 -c:v copy -c:a aac -y ${resultPath}`;
  console.log('FFmpeg command:', ffmpegCommand);

  const ffmpegSession = await FFmpegKit.execute(ffmpegCommand);
  const returnCode = await ffmpegSession.getReturnCode();

  if (ReturnCode.isSuccess(returnCode)) {
    return resultVideo;  // Return the result path
  } else {
    throw new Error('FFmpeg execution failed');
  }
};


export default function App() {
  const searchParams = useSearchParams();
  
  const uri = decodeURIComponent(searchParams.get('uri') || '');
  const [source, setSource] = React.useState(uri);

  React.useEffect(() => {
  
    console.log(source)

  }, [])
  const [multiSliderValue, setMultiSliderValue] = React.useState([0, 5]);
  const [isLoading, setIsLoading] = React.useState(false)
  // Fixing the type of useMutation
  // Correctly use useMutation
  const {
    data,
    error,
    isError,
    isIdle,
    isPaused,
    isSuccess,
    failureCount,
    failureReason,
    mutate,
    mutateAsync,
    reset,
    status,
  } = useMutation<string, Error, [string, number[]]>({
    mutationFn: async ([sourceVideo, multiSliderValue]: [string, number[]]) => {
      return await trimVideoFn(sourceVideo, multiSliderValue);
    },
    onMutate: (variables) => {
      console.log('Mutation in progress with variables:', variables);
    },
    onSuccess: (data) => {
      console.log('Mutation successful:', data);
    },
    onError: (error) => {
      console.log('Error occurred:', error);
    },
    onSettled: (data, error) => {
      console.log('Mutation settled', data, error);
    },
    retry: 3,  // Retry failed mutation 3 times
    retryDelay: 1000,  // 1 second delay between retries
    meta: { key: 'video-trimming' },  // Custom meta data
  });
  
  // Handling trim video logic
  const handleTrimVideo = () => {
    mutate([source, multiSliderValue], {
      onSuccess: (data) => {
        router.push({
          pathname: '/createMetadata',
          params: {
            uri: encodeURIComponent(data!),
          },
        });
      },
      onError: (error) => {
        console.error('Error during trim video:', error);
      },
      onSettled: () => {
        console.log('Trim video mutation settled');
      },
    });
  };
  React.useEffect(() => {
    FFmpegKitConfig.init();
  }, []);



  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color="#ff0033" />}
      {isError && <Text>Error: {error?.message}</Text>}
      {data && (
        <Text style={styles.resultText}>
          Video saved at: {data}
        </Text>
      )}
      <Plyr 
        uri={source} 
        title={'Source'} 
        sliderValue={multiSliderValue} 
        setSliderValue={setMultiSliderValue} 
        trimVideo={handleTrimVideo}  // Trigger the mutation via this function
      />
    </View>
  );
}

const Plyr = (props: { 
  title: string; 
  uri: string; 
  sliderValue: any; 
  setSliderValue: React.Dispatch<React.SetStateAction<any>>; 
  trimVideo: () => void;  
}) => {
  const player = useVideoPlayer(props.uri, (player) => {
    player.loop = false;
    player.currentTime = 0;
  });

  const [videoDuration, setVideoDuration] = React.useState(20);

  React.useEffect(() => {
    if (player.duration) {
      setVideoDuration(Math.floor(player.duration));
    }
  }, [player]);

  React.useEffect(() => {
    const [start, end] = props.sliderValue;
    player.seekBy(start - player.currentTime);

    const interval = setInterval(() => {
      if (player.currentTime >= end) {
        player.pause();
        clearInterval(interval); 
      }
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [props.sliderValue, player]);

  const nonCollidingMultiSliderValuesChange = (values: number[]) => {
    player.play();
    const [start, end] = values;

    if (end > props.sliderValue[1]) {
      props.setSliderValue([end - 5, end]);
    } else {
      props.setSliderValue([start, start + 5]);
    }
  };

  return (
    <View style={styles.videoContainer}>
      <VideoView style={styles.video} player={player} nativeControls={false} />
      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={styles.discardButton}>
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: '/(tabs)/videoSelect',
            });
          }}>
            <Ionicons name="close-outline" color={'#FFF'} size={40} />
          </TouchableOpacity>
        </View>
        <View>
          <MultiSlider
            values={[props.sliderValue[0], props.sliderValue[1]]}
            sliderLength={250}
            onValuesChangeFinish={nonCollidingMultiSliderValuesChange}
            min={0}
            max={videoDuration}
            step={1}
            allowOverlap={false}
            snapped
            isMarkersSeparated={true}
          />
        </View>
        <View style={styles.confirmButton}>
          <TouchableOpacity onPress={props.trimVideo}>
            <Ionicons name="checkmark-outline" color={'#FFF'} size={40} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '90%',
    backgroundColor: '#000',
  },
  confirmButton: {
    margin: 10,
  },
  discardButton: {
    margin: 10,
  },
  resultText: {
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
});
