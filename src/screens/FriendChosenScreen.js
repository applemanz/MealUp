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

export default class FriendChosenScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
   const { params } = navigation.state;

   return {
     title: 'Meal Request',
   }
  };

  state = {index: 0}

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    await this.matchFreeTimes(params.id);
  }

  updateIndex = (index) => {
    this.setState({index})
  }

  printDate = (month, date, day, next) => {
    day += next;
    if (day >= 7) day -= 7;

    date += next;
    if (this.getTimeIndex() >= 28 && next == 0) {
      console.log("Date is over")
      date += 7;
    }

    if (date > numdays[month]) {
      date -= numdays[month];
      month++;
    }
    month = month % 12;
    return days[day] + ", " + months[month] + " " + date;
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

  getTimeIndex = () => {    
    today = new Date();
    thisDay = days[today.getDay()];
    thisHour = today.getHours();
    thisMin = today.getMinutes();
    thisIndex = (thisHour - 7) * 2 + Math.floor(thisMin / 30) - 1;
    console.log("thisIndex: " + thisIndex)
    return thisIndex
  }
  
  async matchFreeTimes(id) {
    freeTimeObj = new Object();
    freeTimeObj[userID] = await this.getFreeTimes(userID);
    freeTimeObj[id] = await this.getFreeTimes(id);
    matches1 = this.match30min(freeTimeObj);
    matches2 = this.match1hr(freeTimeObj);
    this.setState({matches1:matches1,matches2:matches2})
  }

  match30min = (freeTimeObj) => {
    matches = new Object();

    thisIndex = this.getTimeIndex();

    for (const day in freeTimeObj[userID]) {
      matches[day] = Array.from(Array(29), () => true)
      for (i=0; i <= 28; i++) {
        if (day === thisDay && thisIndex < 28 && i <= thisIndex) {
          matches[day][i] = false
          continue;
        }
        for (friend in freeTimeObj)
          if (freeTimeObj[friend][day][i] != 1) {
            matches[day][i] = false
          }
      }
    }
    return matches;
  }

  match1hr = (freeTimeObj) => {
    matches = new Object();

    thisIndex = this.getTimeIndex();

    for (const day in freeTimeObj[userID]) {
      matches[day] = Array.from(Array(28), () => true)
      for (i=0; i < 28; i++) {
        if (day === thisDay && thisIndex < 28 && i <= thisIndex) {
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

  render() {
    const { params } = this.props.navigation.state;
    const name = params.name
    const id = params.id
    const url = params.url

    if (params.CanViewFriend == false) {
      return (
        <View style={{alignItems:'center'}}>
          <Image
              style={{width: 80, height: 80, borderRadius: 40}}
              source={{uri: url}}/>
          <Text style={{textAlign: 'center', padding: 30}}>{name.split(" ")[0]} is not available for a meal this week...{"\n"}Make sure you've selected your availability for meals in the Free Time tab!</Text>
        </View>
      )
    }

    if (this.state.matches1) {

      const reschedule = params.reschedule ? params.reschedule : undefined;
      const sent = params.sent ? params.sent : undefined;
      const mealID = params.mealID ? params.mealID : undefined;

      match1 = [];
      match2 = [];
      d = new Date();
      month = d.getMonth();
      date = d.getDate();
      day = d.getDay();

      // format and sort the matching times
      for (thisday in this.state.matches1) {
        temp = [];
        cur = days.indexOf(thisday);
        for (j = 0; j <= 28; j++) {
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
        for (j = 0; j <= 28; j++) {
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

      // if no matching time, returns message "not available"
      if (match1.length === 0) {
        return (
          <View style={{alignItems:'center'}}>
            <Image
                style={{width: 80, height: 80, borderRadius: 40}}
                source={{uri: url}}/>
            <Text style={{textAlign: 'center', padding: 30}}>{name.split(" ")[0]} is not available for a meal this week...{"\n"}Make sure you've selected your availability for meals in the Free Time tab!</Text>
          </View>
        )
      }

      return(
        <View style={{flex:1}}>
          <View style={{alignItems:'center'}}>
            <Image
              style={{width: 100, height: 100, borderRadius: 50}}
              source={{uri: url}}
            />
            <Text style={{fontSize:15}}>Choose a time to get a meal with </Text>
            <Text style={{fontSize:15, fontWeight:'bold'}}>{name.split(" ")[0]}</Text>
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

                    member = new Object();
                    member[id] = name;

                    this.props.navigation.navigate('FinalRequest',
                      {
                        sent: sent,
                        reschedule: reschedule,
                        name: name,
                        mealID: mealID,
                        // id: id,
                        members: member,
                        dateobj: ymd.toString(),
                        time: item,
                        length: 0.5,
                        isGroup: false,
                      }
                    )
                  }}
                />}
              renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              keyExtractor={(item, index) => index}
            />
            <SectionList
              tabLabel='1 hr'
              style = {{flex:1}}
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

                    member = new Object();
                    member[id] = name;

                    this.props.navigation.navigate('FinalRequest',
                      {
                        sent: sent,
                        reschedule: reschedule,
                        name: name,
                        mealID: mealID,
                        // id: id,
                        members: member,
                        dateobj: ymd.toString(),
                        time: item,
                        length: 1,
                        isGroup: false,
                      }
                    )
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
      );
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
