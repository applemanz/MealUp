import React from 'react';
import { View, Image, Text, TouchableHighlight, SectionList, StyleSheet, ActivityIndicator } from 'react-native';
import NavigationBar from 'navigationbar-react-native';
import {ListItem, Button, Avatar, ButtonGroup} from 'react-native-elements';
import firebase from "../config/firebase";
// import { userName, userID } from '../screens/SignInScreen';

const userID = '10210889686788547'
const db = firebase.firestore();
const numdays = [31,28,31,30,31,30,31,31,30,31,30,31];
const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]




export default class FriendChosenScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
   const { params } = navigation.state;

   return {
     // headerTitle: <LogoTitle
     //                title = {params ? 'Meal with ' + params.name.split(" ")[0] : 'Meal with Unknown'}
     //                url = {params ? params.url : `http://graph.facebook.com/1893368474007587/picture?type=square`}
     //              />,
     title: params ? 'Meal Request with ' + params.name.split(" ")[0] : 'Meal with Unknown',
     headerTitleStyle: {
       fontWeight: '300',
     },
   }
 };


  state = {index: 0}

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

  renderBottom() {
    const { params } = this.props.navigation.state;
    const id = params ? params.id : "1893368474007587";
    const url = params ? params.url : `http://graph.facebook.com/1893368474007587/picture?type=square`;
    const name = params ? params.name : "Chi Yu";

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
            date = t[1].slice(-1);
            // Year is hardcoded at\s 2018
            ymd = new Date(2018,month,date)
            this.props.navigation.navigate('FinalRequest', {
            name: name,
            id: id,
            url: url,
            dateobj: ymd.toString(),
            time: item,
            date: t[1],
          })}}
        />}
        renderSectionHeader={({section}) => <Text style={styles.sectionHeader}>{section.title}</Text>}
        keyExtractor={(item, index) => index}
      />
    return <SectionList
            sections={match2}
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
          />;
  }

  render() {
    const { params } = this.props.navigation.state;
    const name = params ? params.name : "Chi Yu";
    const url = params ? params.url : `http://graph.facebook.com/1893368474007587/picture?type=square`;
    if (this.state.matches1) {
      match1 = [];
      match2 = [];

      for (day in this.state.matches1) {
        temp = [];
        for (j = 0; j < 25; j++) {
          if (this.state.matches1[day][j]) {
            temp.push(this.printTime(j) + "-" + this.printTime(j+1,true))
          }
        }
        if (temp.length > 0) match1.push({title: day, data: temp})
      }

      for (day in this.state.matches2) {
        temp = [];
        for (j = 0; j < 25; j++) {
          if (this.state.matches2[day][j]) {
            temp.push(this.printTime(j) + "-" + this.printTime(j+2,true))
          }
        }
        if (temp.length > 0) match2.push({title: day, data: temp})
      }

      return(
        <View>
          <View style={{alignItems:'center'}}>
          {/* <Avatar
            large
            rounded
            source={{uri: url}}
            onPress={() => console.log("Works!")}
            activeOpacity={0.7}
          /> */}
          <Image
                style={{width: 100, height: 100, borderRadius: 50}}
                source={{uri: url}}
              />
          </View>
          <ButtonGroup
            onPress={this.updateIndex}
            selectedIndex={this.state.index}
            buttons={['30 min', '1 hr']}
            containerStyle={{height: 30}} />
          {this.renderBottom()}
        </View>
      );
    } else
    return (
      <View>
        <ActivityIndicator size="large" color="#000000" />
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
