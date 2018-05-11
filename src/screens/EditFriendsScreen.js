import React from 'react';
import { View, Image, Text, StyleSheet, Button } from 'react-native';
import firebase from "../config/firebase";
import HeaderButtons from 'react-navigation-header-buttons'
import FriendList from '../components/FriendList';
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

export default class EditFriendsScreen extends React.Component {

  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Edit Friends',
        headerRight: (
          <HeaderButtons color = '#ffffff'>
            <HeaderButtons.Item title='Done' onPress={params.ButtonPressed} />
          </HeaderButtons>
        ),
        headerLeft: (
          <HeaderButtons color = '#ffffff'>
            <HeaderButtons.Item title='Cancel' onPress={params.ButtonPressed} />
          </HeaderButtons>
        ),
      };
    };

  state = {friends: []};

  componentWillMount() {
    this.props.navigation.setParams({ ButtonPressed: this.ButtonPressed});
  }

  componentDidMount() {
    db.collection("users").doc(userID).collection('Friends').onSnapshot((querySnapshot) => {
        friends = [];
        querySnapshot.forEach(function(doc) {
            friends.push({
              Name: doc.data().Name,
              url:`http://graph.facebook.com/${doc.id}/picture?type=normal`,
              id: doc.id,
              CanViewMe: doc.data().CanViewMe,
              CanViewFriend: doc.data().CanViewFriend,
              numOfMeals: doc.data().numOfMeals
            })
        });
        this.setState({friends:friends});
    });
  }

  ButtonPressed = () => {
    this.props.navigation.goBack(null)
  }

  compareFriends = (a,b) => {
    var nameA = a.Name.toUpperCase();
    var nameB = b.Name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  render() {
    var obj = [...this.state.friends];
    obj.sort(this.compareFriends);
    return (
      <View style={{flex:1}}>
        <FriendList data = {obj} navigation = {this.props.navigation} editOn = {true} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
  }
})
