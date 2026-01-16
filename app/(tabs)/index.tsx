import { useState, useEffect, useRef } from 'react';
import { Text, View, TextInput, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Platform, Animated, Easing } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Picker } from '@react-native-picker/picker';
import { styles } from './styles';

const LOADING_MESSAGES = [
    "Pretending this is modern art...",
    "Judging the lighting (it's fine)...",
    "Manifesting a masterpiece...",
    "Convincing the pixels to cooperate...",
    "Downloading more RAM...",
    "Removing the boring parts...",
    "Baking the pixels at 350°...",
    "Spilling tea on the server...",
    "Doing very complex math (please wait)...",
    "Asking the AI nicely...",
    "Beeping. Booping. Processing.",
    "Running a very expensive algorithm...",
    "Loading... (Pretend this is fast)...",
    "Please hold, I dropped the paint...",
    "Converting code into art...",
    "Summoning the Art Gods...",
    "Making sure it doesn't look like a blob...",
    "Compiling excuses for the delay...",
    "Slicing onions (crying)...",
    "Drawing lines with a steady hand...",
    "Distracting you with words...",
    "Gone for a snack, be right back...",
    "Marinating the image...",
    "Detecting edges (and trying not to fall off)...",
    "Generating aesthetic vibes...",
    "Teaching your phone art theory..."
];

// REUSABLE INPUT COMPONENT
type FieldInputProps = {
    label: string;
    value: string | number;
    onChange: (value: string) => void;
    suffix?: string;
};

const FieldInput = ({ label, value, onChange, suffix }: FieldInputProps) => (
    <View style={styles.fieldGroup}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputWrapper}>
            <TextInput
                style={styles.input}
                value={String(value)}
                onChangeText={onChange}
                keyboardType="numeric"
            />
            {suffix && <Text style={styles.suffix}>{suffix}</Text>}
        </View>
    </View>
);

const toCm = (ft: number, inch: number) => {
    return ((ft * 30.48) + (inch * 2.54)).toFixed(2);
};

export default function StencilMakerScreen() {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewAspectRatio, setPreviewAspectRatio] = useState(1);
    const colorAnim = useRef(new Animated.Value(0)).current;
    const [previewLoading, setPreviewLoading] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);

    const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);

    // --- ADD THIS EFFECT TO CYCLE TEXTS ---
    useEffect(() => {
        let interval: any;
        let messages: string[] = [];
        if (previewLoading) {
            messages = LOADING_MESSAGES.slice(0, 13);
        } else if (downloadLoading) {
            messages = LOADING_MESSAGES.slice(13);
        }
        if (messages.length > 0) {
            setLoadingText(messages[0]);
            let i = 0;
            interval = setInterval(() => {
                i = (i + 1) % messages.length;
                setLoadingText(messages[i]);
            }, 800); // Changes text every 800ms
        }
        return () => clearInterval(interval);
    }, [previewLoading, downloadLoading]);

    // Form States
    const [width, setWidth] = useState('100');
    const [height, setHeight] = useState('100');
    const [filter, setFilter] = useState('color');
    const [widthFt, setWidthFt] = useState(3);
    const [widthIn, setWidthIn] = useState(3);
    const [heightFt, setHeightFt] = useState(3);
    const [heightIn, setHeightIn] = useState(3);
    const [orientation, setOrientation] = useState('portrait');
    const [addMargins, setAddMargins] = useState('no');
    const [unit, setUnit] = useState('cm');
    const [marginUnit, setMarginUnit] = useState('cm');
    const [marginX, setMarginX] = useState(5); // Left/Right
    const [marginY, setMarginY] = useState(5); // Top/Bottom
    const [marginXFt, setMarginXFt] = useState(0);
    const [marginXIn, setMarginXIn] = useState(2);
    const [marginYFt, setMarginYFt] = useState(0);
    const [marginYIn, setMarginYIn] = useState(2);

    const [downloaded, setDownloaded] = useState(false);

    useEffect(() => {
        Animated.loop(
            Animated.timing(colorAnim, {
                toValue: 1,
                duration: 10000, // Matches your 10s CSS animation
                easing: Easing.linear,
                useNativeDriver: false, // Required for color interpolation
            })
        ).start();
    }, []);

    const textColor = colorAnim.interpolate({
        inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
        outputRange: ['#f55321', '#f02d78', '#5d3fd3', '#53cdfa', '#37fcce', '#f55321']
    });

    // IMAGE PICKER
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
            setPreviewUrl(null);
        }
    };

    // Helper to prepare FormData
    const createFormData = (uri: string) => {
        let tw = unit === 'cm' ? width : toCm(widthFt, widthIn);
        let th = unit === 'cm' ? height : toCm(heightFt, heightIn);
        let mx = addMargins === 'yes' ? (marginUnit === 'cm' ? marginX : toCm(marginXFt, marginXIn)) : 0;
        let my = addMargins === 'yes' ? (marginUnit === 'cm' ? marginY : toCm(marginYFt, marginYIn)) : 0;
        const formData = new FormData();
        // @ts-ignore
        formData.append('file', {
            uri: uri,
            name: 'upload.jpg',
            type: 'image/jpeg',
        });
        formData.append('target_width_cm', String(tw));
        formData.append('target_height_cm', String(th));
        formData.append('filter_type', filter);
        formData.append('orientation', orientation);
        formData.append('add_margins', String(addMargins === 'yes'));
        formData.append('margin_x_cm', String(mx));
        formData.append('margin_y_cm', String(my));
        return formData;
    };

    // GENERATE PREVIEW
    const handlePreview = async () => {
        if (!imageUri) return Alert.alert("Upload", "Please select an image first.");
        setPreviewLoading(true);

        try {
            const backendUrl = 'https://stencil-maker-backend.onrender.com/generate-preview/';
            const formData = createFormData(imageUri);

            const response = await fetch(backendUrl, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (!response.ok) throw new Error("Server error");

            const blob = await response.blob();
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result as string;
                Image.getSize(base64data, (width, height) => {
                    setPreviewAspectRatio(width / height);
                    setPreviewUrl(base64data);
                    setPreviewLoading(false);
                }, (error) => {
                    setPreviewUrl(base64data);
                    setPreviewLoading(false);
                });
            };

        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Failed to generate preview.");
            setPreviewLoading(false);
        }
    };

    // 4. GENERATE PDF & DOWNLOAD
    const handleDownloadPdf = async () => {
        if (!imageUri) {
            Alert.alert("Upload", "Please select an image first.");
            return;
        }

        setDownloadLoading(true);

        try {
            console.log("1. Starting Process...");
            const backendUrl = 'https://stencil-maker-backend.onrender.com/generate-stencil/';
            const formData = createFormData(imageUri);

            const response = await fetch(backendUrl, {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (!response.ok) throw new Error("Server Error");

            console.log("2. Converting Data...");
            const blob = await response.blob();
            
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            
            reader.onloadend = async () => {
                const base64data = (reader.result as string).split(',')[1];
                
                // --- ROBUST PATH FINDER ---
                const fs = FileSystem as any;
                
                // 1. Try to get standard path
                let dir = fs.cacheDirectory || fs.documentDirectory;

                // 2. Safety Check: If it's not a string, or it's empty, FORCE IT.
                if (typeof dir !== 'string') {
                    console.log("Standard path failed. Using hardcoded fallback.");
                    if (Platform.OS === 'android') {
                        // This is the standard cache path for Expo Go on Android
                        dir = "file:///data/user/0/host.exp.exponent/cache/";
                    // } else if (Platform.OS === 'ios') {
                    //     // Standard temp path for iOS
                    //     dir = FileSystem.cacheDirectory; 
                    }
                }

                // 3. Final sanity check
                if (!dir || typeof dir !== 'string') {
                    Alert.alert("Error", "Could not determine phone storage path.");
                    setDownloadLoading(false);
                    return;
                }

                // Ensure trailing slash
                if (!dir.endsWith('/')) {
                    dir += '/';
                }

                const fileUri = dir + `stencil_${Date.now()}.pdf`;
                console.log("3. Saving to:", fileUri);

                try {
                    await fs.writeAsStringAsync(fileUri, base64data, {
                        encoding: 'base64'
                    });

                    setDownloadLoading(false);

                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(fileUri, {
                            mimeType: 'application/pdf',
                            dialogTitle: 'Your Stencil PDF'
                        });
                    } else {
                        Alert.alert("Saved!", "File saved to: " + fileUri);
                    }
                } catch (err) {
                    console.error("Write Error:", err);
                    Alert.alert("Storage Error", "Could not write to phone storage.");
                    setDownloadLoading(false);
                }
            };

        } catch (e) {
            console.error(e);
            Alert.alert("Download Error", "Check console for details.");
            setDownloadLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.mainCard}>
            <Animated.Text style={[styles.header, { color: textColor }]}>STENCIL MAKER</Animated.Text>
            <TouchableOpacity onPress={pickImage} style={styles.uploadBox}>
                <Text style={styles.uploadText}>
                    {imageUri ? "✓ Image Selected" : "Tap to Choose Image"}
                </Text>
            </TouchableOpacity>

            {imageUri && (
                <Image source={{ uri: imageUri }} style={styles.localImage} />
            )}

            <Text style={styles.label}>System</Text>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={unit} onValueChange={setUnit}>
                    <Picker.Item label="Metric (cm)" value="cm" />
                    <Picker.Item label="Imperial ft/inch" value="ft" />
                </Picker>
            </View>

            {unit === 'cm' ? (
            <View style={styles.row}>
                <FieldInput label="Width (cm)" value={width} onChange={setWidth} />
                <FieldInput label="Height (cm)" value={height} onChange={setHeight} />
            </View> ):(
            <View style={styles.grid}>
                <View style={styles.row}>
                    <FieldInput label="Width- ft" value={widthFt} onChange={(v) => setWidthFt(Number(v))} />
                    <FieldInput label="in" value={widthIn} onChange={(v) => setWidthIn(Number(v))} />
                </View>
                <View style={styles.row}>
                    <FieldInput label="Height- ft" value={heightFt} onChange={(v) => setHeightFt(Number(v))} />
                    <FieldInput label="in" value={heightIn} onChange={(v) => setHeightIn(Number(v))} />
                </View>
            </View>
            )}

            <Text style={styles.label}>Add White Margins?</Text>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={addMargins} onValueChange={setAddMargins}>
                    <Picker.Item label="No" value="no" />
                    <Picker.Item label="Yes, add border" value="yes" />
                </Picker>
            </View>

            {addMargins === 'yes' && (
                <>
                    {/* <View style={styles.grid}> */}
                        <Text style={styles.label}>System</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker selectedValue={marginUnit} onValueChange={setMarginUnit}>
                                <Picker.Item label="Metric (cm)" value="cm" />
                                <Picker.Item label="Imperial ft/inch" value="ft" />
                            </Picker>
                        </View>
                    {/* </View> */}

                    {marginUnit === 'cm' ? (
                        <View style={styles.row}>
                            <FieldInput label="X (cm)" value={marginX} onChange={(v) => setMarginX(Number(v))} />
                            <FieldInput label="Y (cm)" value={marginY} onChange={(v) => setMarginY(Number(v))} />
                        </View>
                    ) : (
                        <View style={styles.grid}>
                            <View style={styles.row}>
                                <FieldInput label="X- ft" value={marginXFt} onChange={(v) => setMarginXFt(Number(v))} />
                                <FieldInput label="in" value={marginXIn} onChange={(v) => setMarginXIn(Number(v))} />
                            </View>
                            <View style={styles.row}>
                                <FieldInput label="Y- ft" value={marginYFt} onChange={(v) => setMarginYFt(Number(v))} />
                                <FieldInput label="in" value={marginYIn} onChange={(v) => setMarginYIn(Number(v))} />
                            </View>
                        </View>
                    )}
                </>
            )}

            <Text style={styles.label}>Filter Type</Text>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={filter} onValueChange={setFilter}>
                    <Picker.Item label="Color" value="color" />
                    <Picker.Item label="B&W" value="bw" />
                    <Picker.Item label="Outline" value="outline" />
                </Picker>
            </View>

            <Text style={styles.label}>Orientation</Text>
            <View style={styles.pickerWrapper}>
                <Picker selectedValue={orientation} onValueChange={setOrientation}>
                    <Picker.Item label="Potrait" value="potrait" />
                    <Picker.Item label="Landscape" value="landscape" />
                </Picker>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[styles.button, previewLoading && styles.accentBtn]} 
                    onPress={handlePreview}
                    disabled={previewLoading}
                >
                    {previewLoading ? (
                        <View style={styles.loadingContent}>
                            <ActivityIndicator color="#fff" />
                            {/* --- UPDATED HERE --- */}
                            <Text style={styles.loadingText}>{loadingText}</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Generate Preview</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.button, styles.accentBtn]} 
                    onPress={handleDownloadPdf}
                    disabled={downloadLoading}
                >
                    {downloadLoading ? (
                        <View style={styles.loadingContent}>
                            <ActivityIndicator color="#fff" />
                            {/* --- UPDATED HERE --- */}
                            <Text style={styles.loadingText}>{loadingText}</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>DOWNLOAD PDF</Text>
                    )}
                </TouchableOpacity>
            </View>
            </View>

            {previewUrl && (
                <View style={styles.previewContainer}>
                    <Text style={styles.label}>Grid Preview</Text>
                    <Image
                        source={{ uri: previewUrl }}
                        style={[styles.previewImage, { aspectRatio: previewAspectRatio }]}
                        resizeMode="contain"
                    />
                </View>
            )}
        </ScrollView>
    );
}