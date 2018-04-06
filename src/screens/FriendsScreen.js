import React from 'react';
import { View, Image, Text } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button } from 'react-native-elements';
import firebase from "../config/firebase";
// import { userName, userID } from '../screens/SignInScreen';

const userID = '10210889686788547'
const db = firebase.firestore();

export default class FriendsScreen extends React.Component {
  static navigationOptions = {
    title: 'Friends',
  };

  state = {friends: []};

  componentDidMount() {
    friend = this.state.friends.slice(0);
    db.collection("users").doc(userID).collection('Friends').get().then((querySnapshot) => {
        querySnapshot.forEach(function(doc) {
            friend.push({Name: doc.data().Name, url:`http://graph.facebook.com/${doc.id}/picture?type=square`, id: doc.id})
        });
        this.setState({friends:friend});
    });
  }

  _onPress = (name, id, url) => {
    this.props.navigation.navigate('FriendChosen', {
      name: name,
      id: id,
      url:url
    });
  }

  render() {

    return (
      <View>
      <NavigationBar componentCenter={<Text style={{fontSize: 20, fontWeight: 'bold', color: 'white'}}>Friends</Text>}/>
      <Card containerStyle={{padding: 0}} >
       {
         this.state.friends.map((u, i) => {
           return (
             <ListItem
               key={i}
               roundAvatar
               title={u.Name}
               avatar={{uri:u.url}}
               onPress={() => this._onPress(u.Name,u.id, u.url)}
             />
           );
         })
       }
      </Card>
      </View>
    );
  }
}
