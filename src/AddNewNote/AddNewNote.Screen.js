import React, {Component} from "react";
import {
    BackHandler,
    Image,
    Keyboard,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import styles from './AddNewNote.Style';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import colors from "../Themes/Colors";
import LoadingView from "../Components/LoadingView";
import {localNoteDb} from "../const";
import moment from "moment";
import Toast from "react-native-simple-toast";
import {imgDefault} from "../images";
import ImagePicker from "react-native-image-picker";

const TAG = 'AddNewNote.Screen.js'

export default class AddNewNoteScreen extends Component {

    constructor(props) {
        super(props)
        this.state = {
            isLoading: false,
            title: '',
            content: '',
            image: null,
            isKeyboardShow: false,
            keyboardHeight: 0,
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this.keyboardDidShow
        )
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this.keyboardDidHide
        )
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
        this.keyboardDidShowListener.remove()
        this.keyboardDidHideListener.remove()
    }

    handleBackPress = () => {
        this.props.navigation.goBack()
        this.props.navigation.state.params.returnFromAddNewNote()
        return true
    }

    keyboardDidShow = (e) => {
        this.setState({
            isKeyboardShow: true,
            keyboardHeight: e.endCoordinates.height
        })
    }

    keyboardDidHide = () => {
        this.setState({
            isKeyboardShow: false
        })
    }

    onSaveNotePress = () => {
        Keyboard.dismiss()
        if (this.refTextInputTitle && this.refTextInputTitle._lastNativeText && this.refTextInputContent && this.refTextInputContent._lastNativeText) {
            this.setState({isLoading: true})
            let newNote = {
                title: this.refTextInputTitle._lastNativeText,
                updated_at: moment().unix(),
                content: this.refTextInputContent._lastNativeText,
                img: this.state.image
            }
            localNoteDb
                .post(newNote)
                .then(response => {
                    if (response.ok) {
                        Toast.show('Add new note success')
                        this.handleBackPress()
                    } else {
                        Toast.show('Add new note fail')
                        this.setState({isLoading: false})
                    }
                })
                .catch(err => {
                    console.log(TAG, err)
                    Toast.show(err.message)
                    this.setState({isLoading: false})
                })
        }
    }

    openGallery = () => {
        ImagePicker.showImagePicker({
            maxWidth: 500,
            maxHeight: 500,
            mediaType: 'photo',
        }, image => {
            this.setState({image: image.data})
        })
    }

    // Render UI
    render() {
        return (
            <View style={styles.mainContainer}>
                {this.renderToolbar()}
                {this.renderBody()}
                {this.renderLoading()}
            </View>
        )
    }

    renderToolbar = () => {
        return (
            <View style={styles.toolbar}>
                <TouchableOpacity
                    style={styles.viewWrapIcLeft}
                    onPress={this.handleBackPress}
                >
                    <MaterialCommunityIcons name={'arrow-left'} size={30} color={colors.white}/>
                </TouchableOpacity>
                <View style={styles.viewWrapTitleToolbar}>
                    <Text style={styles.titleToolbar}>Add new</Text>
                </View>
                <TouchableOpacity
                    style={styles.viewWrapIcRight}
                    onPress={this.onSaveNotePress}
                >
                    <MaterialCommunityIcons name={'check'} size={30} color={colors.white}/>
                </TouchableOpacity>
            </View>
        )
    }

    renderBody = () => {
        return (
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.body}>
                    <Text style={styles.textTitle}>Image</Text>

                    <TouchableOpacity
                        onPress={this.openGallery}
                    >
                        <Image style={styles.img}
                               source={this.state.image ? {uri: `data:image;base64,${this.state.image}`} : imgDefault}/>
                    </TouchableOpacity>

                    <Text style={styles.textTitle}>Title</Text>
                    <TextInput
                        style={styles.textInputTitle}
                        ref={ref => this.refTextInputTitle = ref}
                        autoCorrect={false}
                        returnKeyType={'next'}
                        onSubmitEditing={() => {
                            if (this.refTextInputContent) {
                                this.refTextInputContent.focus()
                            }
                        }}
                    />

                    <Text style={styles.textTitle}>Content</Text>
                    <TextInput
                        style={styles.textInputContent}
                        ref={ref => this.refTextInputContent = ref}
                        multiline={true}
                        autoCorrect={false}
                    />

                    {
                        this.state.isKeyboardShow && Platform.OS === 'ios' ?
                            <View style={{height: this.state.keyboardHeight}}/> :
                            null
                    }
                </View>
            </ScrollView>
        )
    }

    renderLoading = () => {
        if (this.state.isLoading) {
            return (
                <LoadingView/>
            )
        } else {
            return null
        }
    }
}
