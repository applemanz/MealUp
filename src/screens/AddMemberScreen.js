import React from 'react';
import { View, Image, Text, StyleSheet, Button, TextInput } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, ButtonGroup, CheckBox, Divider } from 'react-native-elements';
import firebase from "../config/firebase";
import HeaderButtons from 'react-navigation-header-buttons'
import Swiper from 'react-native-swiper';
import FriendList from '../components/FriendList';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class AddMember extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Add New Members',
        headerLeft: (
          <HeaderButtons color = '#ffffff'>
            <HeaderButtons.Item title='Cancel' onPress={params.CancelButtonPressed} />
          </HeaderButtons>
        ),
      };
    };

  state = {friends: [], groupName: "", doneLoading:false};

  componentWillMount() {
    this.props.navigation.setParams({CancelButtonPressed: this.CancelButtonPressed});
  }

  componentDidMount() {
    var friends = [];
    db.collection("users").doc(userID).collection('Friends').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            friends.push({
              Name: doc.data().Name,
              url:`http://graph.facebook.com/${doc.id}/picture?type=normal`,
              id: doc.id,
              CanViewMe: doc.data().CanViewMe,
              CanViewFriend: doc.data().CanViewFriend,
              numOfMeals: doc.data().numOfMeals
            })
        });
        console.log("in componentDidMount")
        console.log(friends)
        this.setState({friends:friends, doneLoading:true});
    });

  }

  CancelButtonPressed = () => {
    this.props.navigation.goBack(null)
  }


  render() {
    const { params } = this.props.navigation.state;
    const groupName = params.groupName
    const members = params.members
    const id = params.id
    data = this.state.friends
    if (this.state.doneLoading) {
    return (
      <View style={{flex:1}}>
        <Text style={{height: 30, fontSize: 20, color: 'black', marginTop:20, marginBottom:20, marginLeft:20}}>
          {"Group Name: " + groupName}
        </Text>
        <Divider style={{ backgroundColor: '#f4511e', height: 3 }} />
        <FriendList data = {data} navigation = {this.props.navigation} currentMembers = {members} addMember = {true} groupName = {groupName} groupID={id}/>
      </View>
    );
  } else return null
  }
}
