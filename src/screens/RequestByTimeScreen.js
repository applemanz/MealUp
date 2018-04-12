import React from 'react';
import { View, Image, Text, TouchableHighlight, SectionList, StyleSheet } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import { Avatar, Card, ListItem, Button, ButtonGroup} from 'react-native-elements';
import ScrollableTabView, {DefaultTabBar, } from 'react-native-scrollable-tab-view';
import firebase from "../config/firebase";
import { userName, userID } from '../screens/SignInScreen';

const db = firebase.firestore();

const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const numdays = [31,28,31,30,31,30,31,31,30,31,30,31];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default class RequestByTimeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
      const params = navigation.state.params || {};
      return {
        title: 'Choose a Time',
      };
    };

  state = {time: {}};

  componentDidMount() {
    time = Object.assign(this.state.time);
    db.collection("users").doc(userID).collection('Freetime').get().then((querySnapshot) => {
        querySnapshot.forEach(function(doc) {
            time[doc.id] = doc.data().Freetime
        });
        this.setState({time:time});
    });
  }

  printTime = (num, ampm = false) => {
    hour = 7 + Math.floor((num+1)/2)
    min = num%2 === 0 ? "30" : "00"
    time = hour >= 12 ? "pm" : "am"
    if (hour > 12) hour -= 12
    if (!ampm) return hour + ":" + min
    else return hour + ":" + min + " " + time
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
    return days[day] + ", " + months[month] + " " + date;
  }

  _onPress = (item, section, length) => {
    t = section.title.split(", ");
    month = months.indexOf(t[1].slice(0, 3));
    date = t[1].slice(4);
    time = item['time'].split("-")
    hour = parseInt(time[0].split(":")[0])
    min = parseInt(time[0].split(":")[1])
    if (item['time'].slice(-2) == "pm" && hour != 12)
      if ((length == 0.5 && time[0] != "11:30") ||
          (length == 1 && hour != 11)) hour += 12
    // Year is hardcoded as 2018
    ymd = new Date(2018,month,date,hour,min)
    this.props.navigation.navigate('TimeChosen', {
      dateobj: ymd.toString(),
      time: item['time'],
      length: length,
      index: item['index'],
      day: item['day']
    })
  }

  render() {
    time1 = [];
    time2 = [];
    d = new Date();
    month = d.getMonth();
    date = d.getDate();
    day = d.getDay();
    hour = d.getHours();
    min = d.getMinutes();
    thisIndex = (hour - 7) * 2 + Math.floor(min / 30) - 1;

    for (thisday in this.state.time) {
      let temp = [];
      for (j = 0; j < 25; j++) {
        if (thisday === day && j <= thisIndex) {
          continue;
        }
        if (this.state.time[thisday][j] === 1) {
          temp.push({time: this.printTime(j) + "-" + this.printTime(j+1,true), index: j, day: thisday})
        }
      }

      diff = days.indexOf(thisday) - day;
      if (diff < 0)
        diff += 7;

      if (temp.length > 0)
        time1.push({title: diff, data: temp})
    }

    console.log("time1")
    console.log(time1)

    for (thisday in this.state.time) {
      let temp = [];
      cur = days.indexOf(thisday);
      for (j = 0; j < 25; j++) {
        if (thisday === day && j <= thisIndex) {
          continue;
        }
        if (this.state.time[thisday][j] === 1 && this.state.time[thisday][j+1] === 1) {
          temp.push({time: this.printTime(j) + "-" + this.printTime(j+2,true), index: j, day: thisday})
        }
      }

      diff = days.indexOf(thisday) - day;
      if (diff < 0)
        diff += 7;

      if (temp.length > 0)
        time2.push({title: diff, data: temp})
    }

    time1.sort((a,b) => a.title - b.title)
    time2.sort((a,b) => a.title - b.title)

    for (i of time1) {
      i.title = this.printDate(month,date,day,i.title)
    }
    for (i of time2) {
      i.title = this.printDate(month,date,day,i.title)
    }

    return (
      <View style={{flex:1}}>
        <ScrollableTabView
          style={{marginTop: 0, flex:1}}
          renderTabBar={() => <DefaultTabBar />}
          onChangeTab = {(i, ref) => {this.setState({onFriends: !this.state.onFriends})}}
          tabBarBackgroundColor = {'#f4511e'}
          tabBarActiveTextColor = {'white'}
          tabBarInactiveTextColor = {'black'}
          tabBarUnderlineStyle = {{backgroundColor:'white'}}
        >
          <SectionList
            tabLabel='30 minutes'
            sections={time1}
            renderItem={({item,section}) =>
              <ListItem
                title={item['time']}
                onPress={() => this._onPress(item,section,length = 0.5)}
              />}
            renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
            keyExtractor={(item, index) => index}
          />
          <SectionList
            tabLabel='1 hour'
            sections={time2}
            renderItem={({item,section}) =>
              <ListItem
                title={item['time']}
                onPress={() => this._onPress(item,section,length = 1)}
              />}
            renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
            keyExtractor={(item, index) => index}
          />
        </ScrollableTabView>
      </View>
    )
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



// renderBottom() {
//   if (this.state.index == 0)
//     return <SectionList
//     sections={time1}
//     renderItem={({item,section}) =>
//     <ListItem
//       title={item['time']}
//       onPress={() => this._onPress(item,section,length = 0.5)}
//     />}
//     renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
//     keyExtractor={(item, index) => index}
//   />
//
//   return <SectionList
//   sections={time2}
//   renderItem={({item,section}) =>
//   <ListItem
//     title={item['time']}
//     onPress={() => this._onPress(item,section,length = 1)}
//   />}
//   renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
//   keyExtractor={(item, index) => index}
// />
//   }
