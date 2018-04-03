import React from 'react';
import { View, Image, Text, TouchableHighlight, SectionList, StyleSheet } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {ListItem, Button, Avatar} from 'react-native-elements';
import firebase from "../config/firebase";
import { userName } from '../screens/SignInScreen';

const userID = '10210889686788547'
const db = firebase.firestore();

export default class FriendChosenScreen extends React.Component {

   getFreeTimes = (id) => {
    return new Promise(resolve => {
      freetimes = new Object()
      db.collection("users").doc(id).collection('Freetime').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            freetimes[doc.id] = doc.data().Freetime
          });
        resolve(freetimes);
      });
    })
  }


  async matchFreeTimes(id) {
    myFreetime = await this.getFreeTimes(userID);
    friendFreetime = await this.getFreeTimes(id);
    matches1 = this.match30min(myFreetime, friendFreetime);
    matches2 = this.match1hr(myFreetime, friendFreetime);

  }

  match30min = (my, friend) => {
    matches = new Object();
    for (const day in my) {
      matches[day] = Array.from(Array(25), () => false)
      for (i=0; i < 25; i++) {
        if (my[day][i] == true && friend[day][i]==true) {
          matches[day][i] = true
        }
      }
    }
    return matches;
  }

  match1hr = (my, friend) => {
    matches = new Object();
    for (const day in my) {
      matches[day] = Array.from(Array(24), () => false)
      for (i=0; i < 24; i++) {
        if (my[day][i] == true && my[day][i+1] == true && friend[day][i]==true && friend[day][i+1]==true) {
          matches[day][i] = true
        }
      }
    }
    return matches;
  }

  render() {
    const { params } = this.props.navigation.state;
    const id = params ? params.id : null;
    const url = params ? params.url : null;
    const name = params ? params.name : null;
    sectiondata = this.matchFreeTimes(id);
    return (
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
                Meal Request with {name.split(" ")[0]}
              </Text>
            </View>}
        />
        <Avatar
          small
          rounded
          source={{uri: url}}
          onPress={() => console.log("Works!")}
          activeOpacity={0.7}
        />
        <SectionList
            sections={[
              {title: 'Monday', data: ['7:00 - 7:30 PM']},
              {title: 'Tuesday', data: ['12:00 - 1:00 PM']},
            ]}
            renderItem={({item}) =>
            <ListItem
              title={item}
              onPress={() => this.props.navigation.navigate('FinalRequest', {
                name: name,
                id: id,
                url:url,
                time: item,
              })}
            />}
            renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
            keyExtractor={(item, index) => index}
          />
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
