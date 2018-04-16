// Note: this page is in need of reformatting because right now the code is very ugly.

import React from 'react';
import { View, Image, Text, TouchableHighlight, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {ListItem, Button, Avatar, ButtonGroup} from 'react-native-elements';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';

const db = firebase.firestore();
const numdays = [31,28,31,30,31,30,31,31,30,31,30,31];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const days = ["Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const today = new Date();
const todayMonth = today.getMonth();
const todayDate = today.getDate();
const todayDay = today.getDay();

export default class GroupChosenScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
   const { params } = navigation.state;

   return {
     title: 'Meal Request',
   }
 }

  state = {index: 0}

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    await this.matchGroup(params.members);
  }

  async matchGroup(members) {
    freeTimeObj = new Object();
    for (let id in members) {
      freeTimeObj[id] = await this.getFreeTimes(id);
      // console.log("HERE 1")
    }
    // console.log("HERE 2")
    matches1 = this.match30min(freeTimeObj);
    matches2 = this.match1hr(freeTimeObj);
    noMatches1 = this.checkNoMatches(matches1);
    noMatches2 = this.checkNoMatches(matches2);

    freeTimeWithoutOne = [];
    // If there are no matches...
    if (noMatches1) {
      for (friendID in members) {
        // does not exclude the user itself
        if (friendID !== userID) {
          let newMembers = Object.assign({},members);
          delete newMembers[friendID];

          //console.log("members:", members)
          console.log("newMebers:", newMembers)

          newFreeTimeObj = new Object();
          for (let id in newMembers) {
            newFreeTimeObj[id] = await this.getFreeTimes(id);
            // console.log("I'm here 1; id =", id)
            // console.log(members[id])
          }
          newMatches1 = this.match30min(newFreeTimeObj);
          newSortedMatches1 = this.sortMatches(newMatches1);
          // console.log(newMatches1)
          // console.log(members[friendID], newSortedMatches1)
          noNewMatches1 = this.checkNoMatches(newMatches1);
          // console.log(noNewMatches1)

          if (!noNewMatches1) {
            // console.log("Hey", newMatches1)
            temp = [];
            for (let index in newSortedMatches1) {
              // console.log("thisday", thisday)
              for (let j = 0; j < 25; j++) {
                // console.log(index, j, newSortedMatches1)
                if (newSortedMatches1[index]['matches'][j]) {
                  // console.log("day", newSortedMatches[index][day])
                  // console.log("day ", day, "diff ", diff, "date ", date)
                  temp.push(this.printDate(todayMonth,todayDate,todayDay,parseInt(index)) + ": " + this.printTime(j) + "-" + this.printTime(j+1,true))
                }
              }
            }
            console.log(temp)
            freeTimeWithoutOne.push({title: "rip " + members[friendID], data: temp})
          }
          // console.log("I'm here 2; friendID =", friendID)
        }
        // console.log("I'm here 3; friendID =", friendID)
    }
  }

  this.sortMatches(matches1);

    this.setState({matches1:matches1,matches2:matches2,noMatches1:noMatches1,noMatches2:noMatches2,freeTimeWithoutOne:freeTimeWithoutOne})
  }

  updateIndex = (index) => {
    this.setState({index})
  }

  printDate = (month, date, day, next) => {
    day += next;
    if (day >= 7) day -= 7;

    date += next;
    if (date > numdays[month]) {
      date -= numdays[month];
      month++;
    }
    month = month % 12;
    return days[day].substr(0,3) + ", " + months[month] + " " + date;
  }

  printTime = (num, ampm = false) => {
    hour = 7 + Math.floor((num+1)/2)
    min = num%2 === 0 ? "30" : "00"
    time = hour >= 12 ? "pm" : "am"
    if (hour > 12) hour -= 12
    if (!ampm) return hour + ":" + min
    else return hour + ":" + min + " " + time
  }

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

  checkNoMatches = (matches) => {
    for (day in matches) {
      for (i = 0; i < matches[day].length; i++) {
        if (matches[day][i])
          return false
      }
    }
    return true
  }

  match30min = (freeTimeObj) => {
    matches = new Object();

    today = new Date();
    thisDay = days[today.getDay()];
    thisHour = today.getHours();
    thisMin = today.getMinutes();
    thisIndex = (thisHour - 7) * 2 + Math.floor(thisMin / 30) - 1;

    for (const day in freeTimeObj[userID]) {
      matches[day] = Array.from(Array(25), () => true)
      for (i=0; i < 25; i++) {
        if (day === thisDay && i <= thisIndex) {
          matches[day][i] = false
          continue;
        }
        for (friend in freeTimeObj) {
          if (freeTimeObj[friend][day][i] != 1) {
            matches[day][i] = false
          }
        }
      }
    }
    return matches;
  }

  match1hr = (freeTimeObj) => {
    matches = new Object();

    today = new Date();
    thisDay = days[today.getDay()];
    thisHour = today.getHours();
    thisMin = today.getMinutes();
    thisIndex = (thisHour - 7) * 2 + Math.floor(thisMin / 30) - 1;

    for (const day in freeTimeObj[userID]) {
      matches[day] = Array.from(Array(24), () => true)
      for (i=0; i < 25; i++) {
        if (day === thisDay && i <= thisIndex) {
          matches[day][i] = false
          continue;
        }
        for (friend in freeTimeObj)
          if (freeTimeObj[friend][day][i] != 1) {
            matches[day][i] = false
            if (i != 0)
              matches[day][i-1] = false
          }
      }
    }
    return matches;
  }

  sortMatches = (matches) => {
    let sortedMatches = [];
    for (let thisday in matches) {
      let diff = days.indexOf(thisday) - todayDay
      if (diff < 0) diff += 7;
      sortedMatches[diff] = {day:thisday, matches:matches[thisday]}
    }
    console.log(sortedMatches)
    return sortedMatches
  }

  render() {
    const { params } = this.props.navigation.state;
    const groupName = params.groupName
    const id = params.id
    const members = params.members

    if (this.state.matches1) {
      console.log("Re-render")
      const reschedule = params ? params.reschedule : undefined;
      const sent = params ? params.sent : undefined;

      if (this.state.noMatches1) {
        // console.log(this.state.freeTimeWithoutOne)
        return(
          <View style={{flex:1}}>
            <View style={{alignItems:'center'}}>
              <View style={{flexDirection:'row', overflow: 'hidden', paddingRight:10, borderRadius:50}} >
                  <View style={{overflow: 'hidden', borderTopLeftRadius: 50, borderBottomLeftRadius: 50}}>
                    <Image
                      style={{width: 50, height: 100,}}
                      source={{uri:urls[0]}} />
                  </View>
                  <View style ={{overflow: 'hidden', borderTopRightRadius: 50, borderBottomRightRadius: 50}}>
                    <Image
                      style={{width: 50, height: 50, }}
                      source={{uri:urls[1]}} />
                    <Image
                      style={{width: 50, height: 50, }}
                      source={{uri:urls[2]}}/>
                  </View>
                </View>
            <Text style={{fontSize:15}}>{'Looks like yall pretty busy, what about...'}</Text>
            </View>
            <ScrollableTabView
              style={{marginTop: 0, flex:1}}
              renderTabBar={() => <DefaultTabBar />}
              onChangeTab = {()=>{}}
              tabBarBackgroundColor = {'white'}
              tabBarActiveTextColor = {'black'}
              tabBarInactiveTextColor = {'black'}
              tabBarUnderlineStyle = {{backgroundColor:'#f4511e'}}
            >
              <SectionList
                tabLabel='30 min'
                sections={this.state.freeTimeWithoutOne}
                renderItem={({item,section}) =>
                  <ListItem
                title={item}
                onPress={() => {
                  // t = section.title.split(", ");
                  month = 1;
                  date = 1;
                  // time = item.split("-")
                  hour = 1
                  min = 1
                  // if (item.slice(-2) == "pm" && hour != 12 && time[0] != "11:30") hour += 12
                  // Year is hardcoded as 2018
                  ymd = new Date(2018,month,date,hour,min)
                  this.props.navigation.navigate('FinalRequest',
                  {
                    sent: sent,
                    reschedule: reschedule,
                    // name: name,
                    // id: id,
                    name: groupName,
                    members: members,
                    dateobj: ymd.toString(),
                    time: item,
                    length: 0.5,
                    isGroup: true,
                  })
                }}
              />}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => index}
              />
              <SectionList
                tabLabel='1 hr (but right now its 30 min lol)'
                sections={this.state.freeTimeWithoutOne}
                renderItem={({item,section}) =>
                  <ListItem
                    title={item}
                    onPress={() => {
                      // t = section.title.split(", ");
                      month = 1;
                      date = 1;
                      // time = item.split("-")
                      hour = 1
                      min = 1
                      // if (item.slice(-2) == "pm" && hour != 12 && time[0] != "11:30") hour += 12
                      // Year is hardcoded as 2018
                      ymd = new Date(2018,month,date,hour,min)
                      this.props.navigation.navigate('FinalRequest',
                      {
                        sent: sent,
                        reschedule: reschedule,
                        // name: name,
                        // id: id,
                        name: groupName,
                        members: members,
                        dateobj: ymd.toString(),
                        time: item,
                        length: 1,
                      })
                    }}
                  />}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => index}
              />
            </ScrollableTabView>
          </View>
        )
      }
      match1 = [];
      match2 = [];
      d = new Date();
      month = d.getMonth();
      date = d.getDate();
      day = d.getDay();

      for (thisday in this.state.matches1) {
        temp = [];
        cur = days.indexOf(thisday);
        for (j = 0; j < 25; j++) {
          if (this.state.matches1[thisday][j]) {
            temp.push(this.printTime(j) + "-" + this.printTime(j+1,true))
          }
        }

        diff = days.indexOf(thisday) - day;
        if (diff < 0) diff += 7;

        if (temp.length > 0) match1.push({title: diff, data: temp})
      }

      for (thisday in this.state.matches2) {
        temp = [];
        for (j = 0; j < 25; j++) {
          if (this.state.matches2[thisday][j]) {
            temp.push(this.printTime(j) + "-" + this.printTime(j+2,true))
          }
        }

        diff = days.indexOf(thisday) - day;
        if (diff < 0) diff += 7;

        if (temp.length > 0) match2.push({title: diff, data: temp})
      }

      match1.sort((a,b) => a.title - b.title)
      match2.sort((a,b) => a.title - b.title)

      for (i of match1) {
        i.title = this.printDate(month,date,day,i.title)
      }

      for (i of match2) {
        i.title = this.printDate(month,date,day,i.title)
      }
 
      urls = []
      for (memberID in members) {
        urls.push(`http://graph.facebook.com/${memberID}/picture?type=large`)
      }
      urls.push(`http://graph.facebook.com/${userID}/picture?type=large`)

      return(
        <View style={{flex:1}}>
          <View style={{alignItems:'center'}}>
            <View style={{flexDirection:'row', overflow: 'hidden', paddingRight:10, borderRadius:50}} >
                <View style={{overflow: 'hidden', borderTopLeftRadius: 50, borderBottomLeftRadius: 50}}>
                  <Image
                    style={{width: 50, height: 100,}}
                    source={{uri:urls[0]}} />
                </View>
                <View style ={{overflow: 'hidden', borderTopRightRadius: 50, borderBottomRightRadius: 50}}>
                  <Image
                    style={{width: 50, height: 50, }}
                    source={{uri:urls[1]}} />
                  <Image
                    style={{width: 50, height: 50, }}
                    source={{uri:urls[2]}}/>
                </View>
              </View>
          <Text style={{fontSize:15}}>{'Choose a time to get a meal with '}</Text>
          <Text style={{fontSize:15, fontWeight:'bold'}}>{groupName}</Text>
          </View>
          <ScrollableTabView
            style={{marginTop: 0, flex:1}}
            renderTabBar={() => <DefaultTabBar />}
            onChangeTab = {()=>{}}
            tabBarBackgroundColor = {'white'}
            tabBarActiveTextColor = {'black'}
            tabBarInactiveTextColor = {'black'}
            tabBarUnderlineStyle = {{backgroundColor:'#f4511e'}}
          >
            <SectionList
              tabLabel='30 min'
              sections={match1}
              renderItem={({item,section}) =>
                <ListItem
              title={item}
              onPress={() => {
                t = section.title.split(", ");
                month = months.indexOf(t[1].slice(0, 3));
                date = parseInt(t[1].slice(4));
                time = item.split("-")
                hour = parseInt(time[0].split(":")[0])
                min = parseInt(time[0].split(":")[1])
                if (item.slice(-2) == "pm" && hour != 12 && time[0] != "11:30") hour += 12
                // Year is hardcoded as 2018
                ymd = new Date(2018,month,date,hour,min)
                this.props.navigation.navigate('FinalRequest',
                {
                  sent: sent,
                  reschedule: reschedule,
                  // name: name,
                  // id: id,
                  name: groupName,
                  members: members,
                  dateobj: ymd.toString(),
                  time: item,
                  length: 0.5,
                  isGroup: true,
                })
              }}
            />}
              renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              keyExtractor={(item, index) => index}
            />
            <SectionList
              tabLabel='1 hr'
              sections={match2}
              renderItem={({item,section}) =>
                <ListItem
                  title={item}
                  onPress={() => {
                    t = section.title.split(", ");
                    month = months.indexOf(t[1].slice(0, 3));
                    date = parseInt(t[1].slice(4));
                    time = item.split("-")
                    hour = parseInt(time[0].split(":")[0])
                    min = parseInt(time[0].split(":")[1])
                    if (item.slice(-2) == "pm" && hour != 12 && hour != 11) hour += 12
                    // Year is hardcoded as 2018
                    ymd = new Date(2018,month,date,hour,min)
                    this.props.navigation.navigate('FinalRequest',
                    {
                      sent: sent,
                      reschedule: reschedule,
                      // name: name,
                      // id: id,
                      name: groupName,
                      members: members,
                      dateobj: ymd.toString(),
                      time: item,
                      length: 1,
                    })
                  }}
                />}
              renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              keyExtractor={(item, index) => index}
            />
          </ScrollableTabView>
        </View>
      )
    }
    else {
      return (
        <View>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )
    }
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
