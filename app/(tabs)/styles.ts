import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingTop: 60,
        backgroundColor: '#f8dbf3',
        minHeight: '100%',
    },
    header: {
        fontSize: 35,
        fontFamily: 'Monoton',
        fontWeight: '700',
        color: '#5d3fd3',
        textAlign: 'center',
        marginBottom: 20,
        letterSpacing: 2,
    },
    mainCard:{
        backgroundColor: '#fff',
        borderRadius: 7,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#1a1a1a',
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#1a1a1a',
        borderStyle: 'dashed',
        padding: 20,
        backgroundColor: '#fdfdfd',
        alignItems: 'center',
        marginBottom: 20,
    },
    uploadText: {
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    localImage: {
        width: 100,
        height: 100,
        alignSelf: 'center',
        marginBottom: 20,
        borderRadius: 8,
    },
    fieldGroup: {
        flex: 1,
        marginBottom: 15,
        marginHorizontal: 5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    grid: {
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    label: {
        fontWeight: '800',
        fontSize: 12,
        marginBottom: 5,
        textTransform: 'uppercase',
        color: '#1a1a1a',
    },
    inputWrapper: {
        flexDirection: 'row',
        backgroundColor: '#333',
        borderWidth: 2,
        borderColor: '#1a1a1a',
    },
    input: {
        flex: 1,
        color: '#fff',
        padding: 10,
        fontWeight: 'bold',
    },
    suffix: {
        color: '#5d3fd3',
        backgroundColor: '#fff',
        padding: 10,
        fontWeight: 'bold',
    },
    pickerWrapper: {
        borderWidth: 2,
        borderColor: '#1a1a1a',
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    buttonContainer: {
        gap: 10,
        marginVertical: 20,
    },
    button: {
        backgroundColor: '#1a1a1a',
        padding: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    accentBtn: {
        backgroundColor: '#5d3fd3',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    previewContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderRadius: 7,
        borderColor: '#1a1a1a',
    },
    previewImage: {
        width: '100%',
    },
    loadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10, // Adds space between spinner and text
        width: '100%',
    },
    loadingText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12, // Slightly smaller to fit long jokes
        textTransform: 'uppercase',
        flexShrink: 1, // Ensures text doesn't push buttons off screen
        textAlign: 'center',
    },
});