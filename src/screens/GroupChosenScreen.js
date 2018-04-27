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
const todayHour = today.getHours();
const todayMin = today.getMinutes();

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
    }

    matches1 = this.match30min(freeTimeObj);
    matches2 = this.match1hr(freeTimeObj);
    noMatches1 = this.checkNoMatches(matches1);
    noMatches2 = this.checkNoMatches(matches2);
    match1 = []; // formatted matches1
    match2 = []; // formatted matches2
    matchFewer1 = []; // for no matching time 30 min
    matchFewer2 = []; // for no matching time 1 hr

    // If there are no matches...
    if (noMatches1) {
      for (friendID in members) {
        // does not exclude the user itself
        if (friendID !== userID) {
          let newMembers = Object.assign({},members);
          delete newMembers[friendID];

          newFreeTimeObj = new Object();
          for (let id in newMembers) {
            newFreeTimeObj[id] = await this.getFreeTimes(id);
          }
          newMatches1 = this.match30min(newFreeTimeObj);
          newMatches2 = this.match1hr(newFreeTimeObj);
          noNewMatches1 = this.checkNoMatches(newMatches1);
          noNewMatches2 = this.checkNoMatches(newMatches2);

            if (!noNewMatches1) {
              temp = [];
              for (let index in newMatches1) {
                for (let j = 0; j <= 28; j++) {
                  if (newMatches1[index]['matches'][j]) {
                    let diff = parseInt(index);
                    temp.push(this.printDate(todayMonth,todayDate,todayDay,diff) + " " + this.printTime(j) + "-" + this.printTime(j+1,true))
                  }
                }
              }
              matchFewer1.push({title: "Meal without " + members[friendID], data: temp})
            }

            if (!noNewMatches2) {
              temp = [];
              for (let index in newMatches2) {
                for (let j = 0; j <= 28; j++) {
                  if (newMatches2[index]['matches'][j]) {
                    let diff = parseInt(index);
                    temp.push(this.printDate(todayMonth,todayDate,todayDay,diff) + " " + this.printTime(j) + "-" + this.printTime(j+2,true))
                  }
                }
              }
              matchFewer2.push({title: "Meal without " + members[friendID], data: temp})
            }
          }
      }
    } else {
      // if there is at least 1 matching time
      for (let index in matches1) {
        temp = [];
        for (let j = 0; j <= 28; j++) {
          if (matches1[index]['matches'][j]) {
            temp.push(this.printTime(j) + "-" + this.printTime(j+1,true))
          }
        }
        let diff = parseInt(index);
        if (temp.length > 0) match1.push({title: this.printDate(todayMonth,todayDate,todayDay,diff), data: temp})
      }

      for (let index in matches2) {
        temp = [];
        for (let j = 0; j <= 28; j++) {
          if (matches2[index]['matches'][j]) {
            temp.push(this.printTime(j) + "-" + this.printTime(j+2,true))
          }
        }
        let diff = parseInt(index);
        if (temp.length > 0) match2.push({title: this.printDate(todayMonth,todayDate,todayDay,diff), data: temp})
      }
    }

    this.setState({match1:match1,match2:match2,noMatches1:noMatches1,noMatches2:noMatches2,matchFewer1:matchFewer1,matchFewer2:matchFewer2})
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
    for (let index in matches) {
      for (let i = 0; i < matches[index]['matches'].length; i++) {
        if (matches[index]['matches'][i])
          return false
      }
    }
    return true
  }

  getTimeIndex = () => {    
    thisIndex = (todayHour - 7) * 2 + Math.floor(todayMin / 30) - 1;
    console.log("thisIndex: " + thisIndex)
    return thisIndex
  }

  match30min = (freeTimeObj) => {
    matches = new Object();
    thisIndex = this.getTimeIndex();

    for (const day in freeTimeObj[userID]) {
      matches[day] = Array.from(Array(29), () => true)
      for (i=0; i <= 28; i++) {
        if (day === days[todayDay] && thisIndex < 28 && i <= thisIndex) {
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
    return this.sortMatches(matches);
  }

  match1hr = (freeTimeObj) => {
    matches = new Object();
    thisIndex = this.getTimeIndex();

    for (const day in freeTimeObj[userID]) {
      matches[day] = Array.from(Array(28), () => true)
      for (i=0; i < 28; i++) {
        if (day === days[todayDay] && thisIndex < 28 && i <= thisIndex) {
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
    return this.sortMatches(matches);
  }

  sortMatches = (matches) => {
    let sortedMatches = [];
    for (let thisday in matches) {
      let diff = days.indexOf(thisday) - todayDay
      if (diff < 0) diff += 7;
      if (this.getTimeIndex() >= 28 && diff == 0) diff += 7;
      sortedMatches[diff] = {day:thisday, matches:matches[thisday]}
    }
    return sortedMatches
  }

  render() {
    const { params } = this.props.navigation.state;
    var groupName = params.groupName
    const id = params.id
    const members = params.members


    if (groupName == "") {
      var names = [];
      for (var memberID in members) {
        if (memberID != userID)
          names.push(members[memberID].split(" ")[0]);
      }
      names.sort()
      var memberStr = ""
      for (name of names) {
        memberStr = memberStr + name + ", "
      }
      memberStr = memberStr.slice(0, -2)
      groupName = memberStr
    }

    if (this.state.match1) {
      const reschedule = params ? params.reschedule : undefined;
      const sent = params ? params.sent : undefined;

      urls = []
      for (memberID in members) {
        urls.push(`http://graph.facebook.com/${memberID}/picture?type=large`)
      }
      urls.push(`http://graph.facebook.com/${userID}/picture?type=large`)

      if (this.state.noMatches1) {
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
            <Text style={{fontSize:15, fontWeight:'bold'}}>{groupName}</Text>
            <Text style={{fontSize:15}}>{'There is no matching time for your group.'}</Text>
            {matchFewer1.length !== 0 && <Text style={{fontSize:15}}>{'Here are the potential times when one person is gone:'}</Text>}
            </View>
            {matchFewer1.length !== 0 &&
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
                sections={this.state.matchFewer1}
                renderItem={({item,section}) =>
                  <ListItem
                title={item}
                onPress={() => {
                  let t = item.split(", ");
                  let arr = t[1].split(" ");
                  let month = months.indexOf(arr[0]);
                  let date = parseInt(arr[1]);
                  let time = arr[2].split("-")
                  let hour = parseInt(time[0].split(":")[0])
                  let min = parseInt(time[0].split(":")[1])
                  if (item.slice(-2) == "pm" && hour != 12 && time[0] != "11:30") hour += 12
                  // Year is hardcoded as 2018
                  let ymd = new Date(2018,month,date,hour,min)
                  console.log(section.title.slice(13))
                  let membersCopy = Object.assign({},members)
                  for (let memberID in membersCopy) {
                    if (membersCopy[memberID] == section.title.slice(13)) {
                      delete membersCopy[memberID]
                      break;
                    }
                  }

                  this.props.navigation.navigate('FinalRequest',
                  {
                    sent: sent,
                    reschedule: reschedule,
                    // name: name,
                    // id: id,
                    name: groupName + " without " + section.title.slice(13),
                    members: membersCopy,
                    dateobj: ymd.toString(),
                    time: arr[2] + " " + arr[3],
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
                sections={this.state.matchFewer2}
                renderItem={({item,section}) =>
                  <ListItem
                    title={item}
                    onPress={() => {
                      let t = item.split(", ");
                      let arr = t[1].split(" ");
                      let month = months.indexOf(arr[0]);
                      let date = parseInt(arr[1]);
                      let time = arr[2].split("-")
                      let hour = parseInt(time[0].split(":")[0])
                      let min = parseInt(time[0].split(":")[1])
                      if (item.slice(-2) == "pm" && hour != 12 && hour != 11) hour += 12
                      // Year is hardcoded as 2018
                      let ymd = new Date(2018,month,date,hour,min)
                      let membersCopy = Object.assign({},members)
                      for (let memberID in membersCopy) {
                        if (membersCopy[memberID] == section.title.slice(13)) {
                          delete membersCopy[memberID]
                          console.log("found")
                          break;
                        }
                      }

                      this.props.navigation.navigate('FinalRequest',
                      {
                        sent: sent,
                        reschedule: reschedule,
                        // name: name,
                        // id: id,
                        name: groupName + " without " + section.title.slice(13),
                        members: membersCopy,
                        dateobj: ymd.toString(),
                        time: arr[2] + " " + arr[3],
                        length: 1,
                        isGroup: true,
                      })
                    }}
                  />}
                renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
                keyExtractor={(item, index) => index}
              />
            </ScrollableTabView>}
          </View>
        )
      }

      // if yes matching time for group
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
              sections={this.state.match1}
              renderItem={({item,section}) =>
                <ListItem
              title={item}
              onPress={() => {
                let t = section.title.split(", ");
                let month = months.indexOf(t[1].slice(0, 3));
                let date = parseInt(t[1].slice(4));
                let time = item.split("-")
                let hour = parseInt(time[0].split(":")[0])
                let min = parseInt(time[0].split(":")[1])
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
              sections={this.state.match2}
              renderItem={({item,section}) =>
                <ListItem
                  title={item}
                  onPress={() => {
                    let t = section.title.split(", ");
                    let month = months.indexOf(t[1].slice(0, 3));
                    let date = parseInt(t[1].slice(4));
                    let time = item.split("-")
                    let hour = parseInt(time[0].split(":")[0])
                    let min = parseInt(time[0].split(":")[1])
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
                      isGroup: true,
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
