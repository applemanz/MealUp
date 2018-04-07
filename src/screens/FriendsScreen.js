import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button, ButtonGroup } from 'react-native-elements';
import firebase from "../config/firebase";
import Swiper from 'react-native-swiper';

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
    db.collection("users").doc(userID).collection('Friends').onSnapshot((querySnapshot) => {
        querySnapshot.forEach(function(doc) {
            friend.push({Name: doc.data().Name, url:`http://graph.facebook.com/${doc.id}/picture?type=normal`, id: doc.id})
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
      <View style={{flex:1}}>
        <ButtonGroup
        onPress={this.updateIndex}
        selectedIndex={this.state.index}
        buttons={['Friends', 'Groups']}
        containerStyle={{height: 30}} />
          <Swiper style={styles.wrapper} showsButtons={false}>
            <View>
              <Text>Friends</Text>
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
            <View>
              <Text>Groups</Text>
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
          </Swiper>
      </View>
    );
    // return (
    //   <View>

    //   </View>
    // );
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
