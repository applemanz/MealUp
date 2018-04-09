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
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]

export default class FriendChosenScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
   const { params } = navigation.state;

   return {
     title: 'Meal Request',
     headerTitleStyle: {
       fontWeight: 'bold',
     },
   }
 };

  state = {index: 0}

  updateIndex = (index) => {
    this.setState({index})
  }

  //sort_days(days) {
  // var day_of_week = new Date().getDay();
  //  var list = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  //  var sorted_list = list.slice(day_of_week).concat(list.slice(0,day_of_week));
  //  return days.sort(function(a,b) { return sorted_list.indexOf(a) > sorted_list.indexOf(b); });
  //}

  printDate = (month, date, day, next) => {
    day += next;
    if (day >= 7) day -= 7;

    date += next;
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


  async matchFreeTimes(id) {
    myFreetime = await this.getFreeTimes(userID);
    friendFreetime = await this.getFreeTimes(id);
    matches1 = this.match30min(myFreetime, friendFreetime);
    matches2 = this.match1hr(myFreetime, friendFreetime);
    this.setState({matches1:matches1,matches2:matches2})
  }

  match30min = (my, friend) => {
    matches = new Object();
    for (const day in my) {
      matches[day] = Array.from(Array(25), () => false)
      for (i=0; i < 25; i++) {
        if (typeof friend[day] == 'undefined') break;
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
        if (typeof friend[day] == 'undefined') break;
        if (my[day][i] == true && my[day][i+1] == true && friend[day][i]==true && friend[day][i+1]==true) {
          matches[day][i] = true
        }
      }
    }
    return matches;
  }

  async componentDidMount() {
    const { params } = this.props.navigation.state;
    const id = params ? params.id : "1893368474007587";
    await this.matchFreeTimes(id);
  }

  render() {
    const { params } = this.props.navigation.state;
    const name = params ? params.name : "Chi Yu";
    const id = params ? params.id : "1893368474007587";
    const url = params ? params.url : `http://graph.facebook.com/1893368474007587/picture?type=large`;
    //|| (Object.keys(this.state.matches1).length==0 && Object.keys(this.state.matches2).length==0)
    if (params.CanViewFriend == false) {
      return (
        <View style={{alignItems:'center'}}>
          <Image
              style={{width: 80, height: 80, borderRadius: 40}}
              source={{uri: url}}/>
          <Text>{name.split(" ")[0]} is not available for a meal this week</Text>
        </View>
      )
    }
    if (this.state.matches1) {
      // match1 = [];
      // match2 = [];
      //
      // for (day in this.state.matches1) {
      //   temp = [];
      //   for (j = 0; j < 25; j++) {
      //     if (this.state.matches1[day][j]) {
      //       temp.push(this.printTime(j) + "-" + this.printTime(j+1,true))
      //     }
      //   }
      //   if (temp.length > 0) match1.push({title: day, data: temp})
      // }
      //
      // for (day in this.state.matches2) {
      //   temp = [];
      //   for (j = 0; j < 25; j++) {
      //     if (this.state.matches2[day][j]) {
      //       temp.push(this.printTime(j) + "-" + this.printTime(j+2,true))
      //     }
      //   }
      //   if (temp.length > 0) match2.push({title: day, data: temp})
      // }

      const reschedule = params ? params.reschedule : undefined;
      const sent = params ? params.sent : undefined;

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



      return(
        <View style={{flex:1, alignItems:'center'}}>
          <Image
            style={{width: 100, height: 100, borderRadius: 50}}
            source={{uri: url}}
          />
          <Text>Choose a time to get a meal with {name.split(" ")[0]}</Text>
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
                this.props.navigation.navigate('FinalRequest', {
                sent: sent,
                reschedule: reschedule,
                name: name,
                id: id,
                url: url,
                dateobj: ymd.toString(),
                time: item,
                length: 0.5,
              })}}
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
                      this.props.navigation.navigate('FinalRequest', {
                      sent: sent,
                      reschedule: reschedule,
                      name: name,
                      id: id,
                      url: url,
                      dateobj: ymd.toString(),
                      time: item,
                      length: 1,
                    })}}
                  />}
              renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
              keyExtractor={(item, index) => index}
            />
          </ScrollableTabView>
        </View>
      );
    }
    else {
      return (
        <View>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  }

  renderBottom() {
    const { params } = this.props.navigation.state;
    const id = params ? params.id : "1893368474007587";
    const url = params ? params.url : `http://graph.facebook.com/1893368474007587/picture?type=square`;
    const name = params ? params.name : "Chi Yu";
    const reschedule = params ? params.reschedule : undefined;
    const sent = params ? params.sent : undefined;

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

    if (this.state.index == 0)
        return <SectionList
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
            this.props.navigation.navigate('FinalRequest', {
            sent: sent,
            reschedule: reschedule,
            name: name,
            id: id,
            url: url,
            dateobj: ymd.toString(),
            time: item,
            length: 0.5,
          })}}
        />}
        renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        keyExtractor={(item, index) => index}
      />
    return <SectionList
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
                this.props.navigation.navigate('FinalRequest', {
                sent: sent,
                reschedule: reschedule,
                name: name,
                id: id,
                url: url,
                dateobj: ymd.toString(),
                time: item,
                length: 1,
              })}}
            />}

            renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
            keyExtractor={(item, index) => index}
          />;
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
