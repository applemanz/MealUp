import React from 'react';
import { View, Image, Text, TouchableHighlight, SectionList, StyleSheet } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {ListItem} from 'react-native-elements';
import firebase from "../config/firebase";
import { userName } from '../screens/SignInScreen';

const userID = '10210889686788547'
const db = firebase.firestore();

export default class TimeChosenScreen extends React.Component {

  state = {}
  
  getTime = (id, day, time) => {
    return new Promise(resolve => {
      j = false;
      db.collection("users").doc(id).collection('Freetime').doc(day).get().then((doc) => {
        if (doc.exists) {
          j = doc.data().Freetime[time]
        }
        resolve(j);
      });
    })
  }

  async getFreeFriends(day, time) {
    myFriends = await this.getFriends()
    free = []
    for (fd in myFriends) {
      isfree = await this.getTime(fd, day, time)
      if (isfree) free.push(myFriends[fd])
    }
    this.setState({free:free});
  }

  getFriends = () => {
    return new Promise(resolve => {
      names = new Object()
      db.collection("users").doc(userID).collection('Friends').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            names[doc.id] = doc.data().Name
          });
        resolve(names);
      });
    })
  }

  async componentDidMount() {
    await this.getFreeFriends('Monday',1)
  }
  
  renderBottom() {
    return <SectionList
    sections={[{title: "Friends", data: this.state.free}]}
    renderItem={({item}) =>
    <ListItem
      title={item}
      onPress={() => this.props.navigation.navigate('FinalRequest', {
       name: name,
       id: id,
       url: url,
        time: item,
      })}
    />}
    renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
    keyExtractor={(item, index) => index}
  />
  }

  render() {
    if (this.state.free) {
      return(
          <View>
          <NavigationBar
            componentLeft={
              <View style={{flex: 1}}>
                <TouchableHighlight onPress={() => this.props.navigation.goBack()}>
                  <Text style={{fontSize: 15, color: 'white'}}>
                    Back
                  </Text>
                </TouchableHighlight>
              </View>}
            componentCenter={
              <View style={{flex: 1}}>
                <Text style={{fontSize: 20, color: 'white'}}>
                  Select Friend
                </Text>
              </View>}
          />
          {this.renderBottom()}
        </View>
      ); 
    }
    else 
    return (<View>
      <NavigationBar
            componentLeft={
              <View style={{flex: 1}}>
                <TouchableHighlight onPress={() => this.props.navigation.goBack()}>
                  <Text style={{fontSize: 15, color: 'white'}}>
                    Back
                  </Text>
                </TouchableHighlight>
              </View>}
            componentCenter={
              <View style={{flex: 1}}>
                <Text style={{fontSize: 20, color: 'white'}}>
                  Select Friend
                </Text>
              </View>}
          />
          <Text>I am a fancy loading screen</Text>
    </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
   paddingTop: 22
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(247,247,247,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
})