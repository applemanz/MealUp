import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform, TouchableHighlight, Modal, Button, Image, ScrollView, SectionList, AsyncStorage} from 'react-native';
import { Avatar, ListItem, Divider } from 'react-native-elements';
import {Agenda} from 'react-native-calendars';
import firebase from "../config/firebase";
import { Ionicons } from '@expo/vector-icons';
import { Calendar, Permissions } from 'expo';
import { userName, userID } from './SignInScreen';
import NavigationBar from 'react-native-navbar';
var moment = require('moment');
const db = firebase.firestore();

const data_flip = {'7:30 AM': 0, '8:00 AM': 1, '8:30 AM': 2, '9:00 AM': 3, '9:30 AM': 4, '10:00 AM': 5, '10:30 AM': 6,
'11:00 AM': 7, '11:30 AM': 8, '12:00 PM': 9, '12:30 PM': 10, '1:00 PM': 11, '1:30 PM': 12, '2:00 PM': 13, '2:30 PM': 14,
'3:00 PM': 15, '3:30 PM': 16, '4:00 PM': 17, '4:30 PM': 18, '5:00 PM': 19, '5:30 PM': 20, '6:00 PM': 21, '6:30 PM': 22,
'7:00 PM': 23, '7:30 PM': 24}
const weekdays = [
{key:0, day:'Sunday'}, {key:1, day:'Monday'}, {key:2, day:'Tuesday'}, {key:3, day:'Wednesday'}, {key:4, day:'Thursday'},
{key:5, day:'Friday'}, {key:6, day:'Saturday'}
]

export default class HomeScreen extends Component {
  static navigationOptions = {
    title: 'Meals'
  };

  constructor(props) {
    super(props);
    let items = this.createEmptyData()
    this.state = {
      items: items,
      refreshing: false,
      modal: false,
      mealModal: false,
      mealItem: {},
      curMeal: "",
      displaydate: "",
      selectCalendarModal: false,
      calendars: [],
      selectedCalendar: {}
    }
  }

  async componentWillMount() {
    try {
      calendarPermission = await AsyncStorage.getItem('calendarPermission');
    } catch (error) {
      calendarPermission = false
    }
    if (calendarPermission === 'true') {
      calendarPermission = true
    }
    console.log(calendarPermission)
    this.setState({calendarPermission:calendarPermission})

    db.collection('users').doc(userID).get().then((doc)=>{
      if (doc.data().selectedCalendar)
        this.setState({selectedCalendar:doc.data().selectedCalendar})
      console.log(doc.data().selectedCalendar)
    })
  }

  async componentDidMount() {
    // this.props.navigation.addListener('willFocus', ()=>{
    //   this.onRefresh();
    // });

    db.collection("users").doc(userID).collection('Meals').onSnapshot((querySnapshot) => {
      // meals = [];
      db.collection('users').doc(userID).get().then((userinfo)=>{
        calendarInfo = userinfo.data().Calendar
        // console.log(calendarInfo)
        let meals = []
        querySnapshot.forEach((doc) => {
          // if (doc.id === 'calendar') {return}
          today = new Date()
          today.setHours(0, 0, 0, 0)
          if (doc.data().DateTime >= today) {



            if (this.state.calendarPermission && this.state.selectedCalendar.id) {
              if (calendarInfo) {
                  if (!calendarInfo[doc.id] || !calendarInfo[doc.id].inCalendar) {
                    let meal = doc.data()
                    meal.docid = doc.id
                    this.addToCalendar(meal)
                  }
              }
            }
            meals.push(doc.data());
            meals[meals.length-1]['docid'] = doc.id;
            //console.log("SETTING DOCID TO " + meals[meals.length-1] + " " + doc.id);
          }
          else {
            //console.log("MEAL HAS PASSED: " + doc.data().DateTime);
            // TODO convert meal back to freetime in array
            weekday = weekdays[doc.data().DateTime.getDay()].day
            freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
            freetimeRef.get().then(function(doc) {
              freetimeData = doc.data();
              for (i = 0; i < freetimeData['Freetime'].length; i++) {
                if (freetimeData['Freetime'][i] === 2) {
                  freetimeData['Freetime'][i] = 1
                }
              }
            freetimeRef.set(freetimeData).then(() => {
              // console.log("My Document updated");
              })
              .catch(function(error) {
                // console.error("Error updating", error);
              });
            })
            db.collection("users").doc(userID).collection('Meals').doc(doc.id).delete().then(() => {
              //console.log("Document successfully deleted!");
              db.collection("users").doc(doc.data().FriendID).collection('Meals').doc(doc.id).delete()
            }).catch(function(error) {
              // console.error("Error removing document: ", error);
            });
          }
        })
        console.log('meals')
        console.log(meals)
        if (meals.length == 0) {
          updatedItems = this.createEmptyData()
          this.setState((prevState) => {
            return {items: updatedItems}
          });
        }
        console.log(meals)
        // this.setState({meals:meals})
        this.updateItems(meals);
      })
    });
  }

  createEmptyData = () => {
    today = new Date()
    emptyItems = new Object()
    for (i = 0; i < 7; i++) {
      emptyItems[this.addDays(today, i)] = []
    }
    return emptyItems
  }

  addDays = (date, days) => {
    var dat = new Date(date);
    dat.setDate(dat.getDate() + days);
    dateStr = Platform.OS === 'ios' ? this.convertDate(dat.toLocaleDateString('en-US')) : this.convertDateAndroid(dat.toLocaleDateString('en-US'))
    return dateStr
  }

  convertDate = (date) => {
    entries = date.split("/")
    if (entries[0] < 10) {
      month = '0' + entries[0]
    } else {
      month = entries[0]
    }
    if (entries[1] < 10) {
      day = '0' + entries[1]
    } else {
      day = entries[1]
    }
    return (entries[2] + '-' + month + '-' + day)
  }

  convertDateAndroid = (date) => {
    entries = date.split("/")
    return ('20'+entries[2]+'-'+entries[0]+'-'+entries[1])
  }

  updateItems = (meals) => {
    var items = new Object();
    for (meal of meals) {
      var Day = meal['DateTime']
      dateID = Platform.OS === 'ios' ? this.convertDate(Day.toLocaleDateString('en-US')) : this.convertDateAndroid(Day.toLocaleDateString('en-US'))
      if (dateID in items) {
        mealItems = items[dateID]
      } else {
        mealItems = []
      }
      mealEntry = new Object()
      // Group
      if (meal['isGroup'] === true) {
        mealEntry['isGroup'] = true
        mealEntry['members'] = meal['members']
        mealEntry['text'] = meal['groupName']
        urls = []
        for (mealID in meal.members) {
          if (meal.members[mealID].accepted == true)
            urls.push(`http://graph.facebook.com/${mealID}/picture?type=large`)
        }
        mealEntry['urls'] = urls
      }
      // Single Friend
      else {
        mealEntry['text'] = meal['FriendName'].split(" ")[0]
        mealEntry['urls'] = [`http://graph.facebook.com/${meal['FriendID']}/picture?type=large`]
      }
      mealEntry['subtext'] = `${meal['TimeString']} at ${meal['Location']}`
      mealEntry['docid'] = meal['docid']
      mealEntry['meal'] = meal
      mealEntry['displaydate'] = meal.DateTime.toDateString().substring(0,10);
      mealEntry['datetime'] = meal.DateTime;
      mealItems.push(mealEntry)
      items[dateID] = mealItems
    }
    // console.log('in update meals')
    //console.log(items)
    updatedItems = this.createEmptyData()

    for (dateID in updatedItems) {
      if (dateID in items) {
        items[dateID].sort(function(a, b) {
          a = a.datetime;
          b = b.datetime;
          return a>b ? 1 : a<b ? -1 : 0;
        });
        updatedItems[dateID] = items[dateID]
        //console.log("DOCID " + items[dateID][0].displaydate)
      }
    }
    //console.log(updatedItems)
    this.setState((prevState) => {
      return {items: updatedItems}
    });
  }

  render() {
    today = new Date()
    // console.log(today)
    // console.log("converted today", this.convertDate(today.toLocaleDateString('en-US')))
    minDate = Platform.OS === 'ios' ? this.convertDate(today.toLocaleDateString('en-US')) : this.convertDateAndroid(today.toLocaleDateString('en-US'))
    maxDate = this.addDays(today, 7)
    // console.log("Maxdate", maxDate)
    // console.log('in render')
    //console.log(this.state.items)
    return (
      <View style={{flex: 1}}>
        <Button
          onPress={this.calendarSetUp}
          title="Export to Calendar"
          // color="black"
        />
        <Divider style={{ backgroundColor: '#cbd2d9' }}/>
      <Agenda items={this.state.items}
        style={{flex:1}}
        // refreshing={this.state.refreshing}
        // onRefresh={this.onRefresh}
        // loadItemsForMonth={this.loadMeals.bind(this)}
        selected={minDate}
        // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
        minDate={minDate}
        // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
        maxDate={maxDate}
        // Max amount of months allowed to scroll to the past. Default = 50
        pastScrollRange={2}
        // Max amount of months allowed to scroll to the future. Default = 50
        futureScrollRange={2}
        renderItem={this.renderItem}
        renderEmptyDate={this.renderEmptyDate.bind(this)}
        rowHasChanged={this.rowHasChanged.bind(this)}
        hideKnob={true}
        theme={{
          backgroundColor: 'transparent',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#f4511e',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#f4511e',
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: '#00adf5',
          selectedDotColor: '#ffffff',
          arrowColor: 'orange',
          monthTextColor: 'blue',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 16,
          // agendaDayTextColor: 'yellow',
          // agendaDayNumColor: 'green',
          agendaTodayColor: '#f4511e',
        }}
      />
      {this.modal()}
      {this.mealModal()}
      {this.calendarModal()}
    </View>
    )
  }

  calendarModal() {
    return (
      <Modal
        onRequestClose={() => this.setState({selectCalendarModal: false})}
        transparent={false}
        visible={this.state.selectCalendarModal}
        animationType = 'slide'
        >
        <View style={{
          flex: 1,
          // flexDirection: 'column',
          // justifyContent: 'center',
          // alignItems: 'center',
        }}>
        <NavigationBar
          title={{title:'Calendars', style:{fontWeight:'bold', }, tintColor:'white'}}
          rightButton={{title:'Done', handler:()=>{
            this.exportMeals()
            this.setState({selectCalendarModal: false})
          }, tintColor:'white'}
          }
          leftButton={{title:'Cancel', handler:()=>{
            this.setState({selectCalendarModal: false})
          }, tintColor:'white'}
          }
          tintColor={'#f4511e'}
          containerStyle={Platform.OS === 'ios' ? {} : {height:60, justifyContent:'center'} }
        />
        <SectionList
          stickySectionHeadersEnabled = {false}
         renderItem={({ item, index, section }) =>
           <ListItem
              key={index}
              title={item.title}
              // onPress={()=>this.setState({selectedCalendar:item})}
              onSwitch={()=>{
                if (this.state.selectedCalendar.id === item.id) {
                  this.setState({selectedCalendar:{}})
                  // db.collection('users').doc(userID).update({selectedCalendar:null})
                }
                else {
                  this.setState({selectedCalendar:item})
                  // db.collection('users').doc(userID).update({selectedCalendar:item})
                }
              }}
              hideChevron
              switchButton
              switchOnTintColor = {item.color}
              switchTintColor = {Platform.OS === 'ios' ? item.color : 'gray'}
              switched = {this.state.selectedCalendar.id === item.id}
              // underlayColor = {item.color}
            />
         }
         renderSectionHeader={({ section: { title } }) =>
         <View>
          <Text style={{ fontWeight: 'bold', textAlign:'left', color:'gray', marginTop:40, marginLeft:10 }}>
            {title.toUpperCase()}
          </Text>
          <Divider style={{ backgroundColor: '#cbd2d9' }}/>
        </View>
        }
         sections={this.state.calendars}
         keyExtractor={(item, index) => item + index} />
        </View>
      </Modal>
    )
  }

  exportMeals = () => {

    db.collection('users').doc(userID).get().then((userinfo)=>{
      let calendarInfo = userinfo.data().Calendar
      let selectedCalendar = userinfo.data().selectedCalendar

      // first time uploading
      if (!calendarInfo && this.state.selectedCalendar.id) {
        db.collection("users").doc(userID).collection('Meals').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let meal = doc.data()
            meal.docid = doc.id
            this.addToCalendar(meal)
          })
        })
      }
      else if (this.state.selectedCalendar.id && selectedCalendar !== this.state.selectedCalendar) {
        console.log('new calendar selected')
        // bug
        if (selectedCalendar) {
          for (mealID in calendarInfo) {
            console.log(calendarInfo[mealID].calendarID)
            console.log(selectedCalendar.id)
            if (calendarInfo[mealID].calendarID === selectedCalendar.id)
              Calendar.deleteEventAsync(calendarInfo[mealID].eventID)
          }
        }

        db.collection("users").doc(userID).collection('Meals').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            let meal = doc.data()
            meal.docid = doc.id
            this.addToCalendar(meal)
          })
        })
      }
      else if (this.state.selectedCalendar.id) {
        db.collection("users").doc(userID).collection('Meals').get().then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            if (!calendarInfo[doc.id] || !calendarInfo[doc.id].inCalendar) {
              let meal = doc.data()
              meal.docid = doc.id
              this.addToCalendar(meal)
            }
          })
        })
      }

      if (this.state.selectedCalendar.id)
        db.collection('users').doc(userID).update({selectedCalendar:this.state.selectedCalendar})
      else
        db.collection('users').doc(userID).update({selectedCalendar:null})
    })
  }

  addToCalendar = async (meal) => {
    if (this.state.selectedCalendar.id) {
    if (!meal.isGroup) {
      start = moment(meal.DateTime)
      if (meal.Length === 0.5)
        start.add(30, 'm')
      else start.add(1, 'h')
      console.log(start.format())
    let details = Platform.OS === 'ios' ? {
        startDate: meal.DateTime.toISOString(),
        endDate: start.toISOString(),
        title: `Meal with ${meal.FriendName.split(" ")[0]}`,
        location: meal.Location,
      } : {
        startDate: meal.DateTime.toISOString(),
        endDate: start.toISOString(),
        title: `Meal with ${meal.FriendName.split(" ")[0]}`,
        location: meal.Location,
        timeZone: "America/New_York",
      }
    console.log(details)
    console.log(this.state.selectedCalendar.id)
    mealID = await Calendar.createEventAsync(this.state.selectedCalendar.id, details)
    mealID = mealID.toString()
    let data = {[`Calendar.${meal.docid}.inCalendar`]: true, [`Calendar.${meal.docid}.eventID`]:mealID, [`Calendar.${meal.docid}.calendarID`]: this.state.selectedCalendar.id}
    console.log(data)
    db.collection("users").doc(userID).update(data)
    }
    }

  }

  calendarSetUp = async () => {
    const { status } = await Permissions.askAsync('calendar');
    if (status === 'granted') hasCalendarPermission = 'true'
    else hasCalendarPermission = 'false'
    console.log(hasCalendarPermission)
    try {
      await AsyncStorage.setItem('calendarPermission', hasCalendarPermission);
    } catch (error) {
      console.log('could not save calendar permission')
      console.log(error)
    }

    if (hasCalendarPermission === 'true') {

      cals = await Calendar.getCalendarsAsync()
      // console.log(cals)
      if (Platform.OS === 'ios') {
        sources = await Calendar.getSourcesAsync()
        // console.log(sources)
        calendars = []
        sections = []
        for (let source of sources) {
          sections.push({title:source.name, data:[]})
        }
        // console.log(sections)
        for (let cal of cals) {
          console.log(cal.source.name)
          index = sections.findIndex(source => source.title===cal.source.name)
          sections[index].data.push(cal)
        }
        // console.log(sections)
        sections.sort(function(a, b) {
          aTitle = a.title.toUpperCase()
          bTitle = b.title.toUpperCase()
          if (aTitle < bTitle) {
            return -1;
          }
          if (aTitle > bTitle) {
            return 1;
          }
          return 0;
        })

        this.setState({calendars:sections})
      }
      else {
        sections = []
        sources = new Set()
        for (let cal of cals) {
          sources.add(cal.source.name)
        }
        for (let source of sources) {
          sections.push({title:source, data:[]})
        }
        for (let cal of cals) {
          index = sections.findIndex(source => source.title===cal.source.name)
          sections[index].data.push(cal)
        }
        // console.log(sections)
        sections.sort(function(a, b) {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        })

        this.setState({calendars:sections})
      }
      this.setState({selectCalendarModal:true})
    }
  }

  itemPressed = (item) => {
    this.setState({mealModal: true, curMeal: item.docid, displaydate: item.displaydate, mealItem: item.meal});
  }

  requestPressed = () => {
    this.setState({modal: true});
  }

  renderItem = (item) => {
    if (item.datetime.getHours() < 11)
      color = '#fdcb6e'
    else if (item.datetime.getHours() >= 11 && item.datetime.getHours() < 17)
      color = '#f9a56a'
    else
      color = '#e17055'
    if (item.isGroup) {
      return (
        <TouchableHighlight
          style={{marginTop:17}}
          onPress={() => this.itemPressed(item)}
          underlayColor='transparent'>
        <View style={[styles.item, {backgroundColor:color}]}>
          <Ionicons name="ios-contacts" size={35} color="black" style={{marginRight:10}} />
          <View>
            <Text style = {{fontSize:15, fontWeight:'bold'}}>{item.text}</Text>
            <Text style = {{fontSize:15}}>{item.subtext}</Text>
          </View>
        </View>
        </TouchableHighlight>
      )
    }
    else {
      return (
        <TouchableHighlight
          style={{marginTop:17}}
          onPress={() => this.itemPressed(item)}
          underlayColor='transparent'>
        <View style={[styles.item, {backgroundColor:color}]}>
          <Image
            style={{width: 35, height: 35, borderRadius: 17.5, marginRight:10}}
            source={{uri: item.urls[0]}}
        />
          <View>
            <Text style = {{fontSize:15, fontWeight:'bold'}}>{item.text}</Text>
            <Text style = {{fontSize:15}}>{item.subtext}</Text>
          </View>
        </View>
        </TouchableHighlight>
      )
    }

  }

  renderEmptyDate() {
    return (
      <TouchableHighlight
        onPress={this.requestPressed}
        style={styles.empty}
        underlayColor='#CBD1D3'
        >
          <Text>No meals scheduled. Schedule a meal?</Text>
      </TouchableHighlight>
    )
  }

  rowHasChanged(r1, r2) {
    return r1 !== r2;
  }

  RequestByFriend = () => {
    this.setState({modal: false});
    this.props.navigation.navigate('RequestByFriend');
  }

  RequestByTime = () => {
    this.setState({modal: false});
    this.props.navigation.navigate('RequestByTime');
  }

  modal() {
    return (
    <View>
      <Modal
        onRequestClose={() => this.setState({modal: false})}
        transparent={true}
        visible={this.state.modal}
        animationType = 'none'
        >
        <View style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#00000080'}}>
          <View style={{
            width: 300,
            height: 300,
            backgroundColor: '#fff', padding: 20}}>
            <View style={{padding: 15}}>
              <Button onPress={this.RequestByFriend} title="Request by Friend"/>
            </View>
            <View style={{padding: 15}}>
              <Button onPress = {this.RequestByTime} title="Request by Time"/>
            </View>
            <View style={{padding: 25, alignItems: 'center'}}>
              <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
                onPress={() => this.setState({modal: false})}>
                <Text style={{fontSize: 15, textAlign: 'right'}}>Cancel</Text>
              </TouchableHighlight>
            </View>
          </View>
        </View>
      </Modal>
    </View>
    )
  }

  mealModal() {
    if (this.state.mealItem.isGroup && this.state.mealItem.initiator == userID)
      height = 400
    else if (this.state.mealItem.isGroup)
      height = 275
    else height = 420
    return (
    <View>
      <Modal
      onRequestClose={() => this.setState({mealModal: false})}
      transparent={true}
      visible={this.state.mealModal}>
      <View style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#00000080'}}>
        <View style={{
            width: 300,
            height: height,
            backgroundColor: '#fff', padding: 20}}>
          <View style={{alignItems: 'center'}}>
            {this.state.mealItem.isGroup &&
              <View style={{alignItems:'center'}}>
                <View style={{flexDirection: 'row', flexWrap:'wrap'}}>
                  {this.renderAvatars()}
                </View>
                  <Text style={{fontWeight:'bold', fontSize:20, padding: 10}}>{this.state.mealItem.groupName}</Text>
              </View>
            }
            {!this.state.mealItem.isGroup &&
              <View style={{alignItems:'center'}}>
                <Image
                  style={{width: 100, height: 100, borderRadius: 50, padding:10}}
                  source={{uri: `http://graph.facebook.com/${this.state.mealItem.FriendID}/picture?type=large`}}
                />
                <Text style={{fontSize:20, fontWeight:'bold', padding:10, }}>
                  {this.state.mealItem.FriendName}
                </Text>
              </View>
            }
            <Text style={{padding: 10, textAlign:'center'}}>
              {this.state.displaydate} {this.state.mealItem.TimeString} at {this.state.mealItem.Location}
            </Text>
          </View>

          {this.state.mealItem.isGroup && this.state.mealItem.initiator !== userID &&
            <TouchableHighlight
              style={{marginTop:30,padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
              onPress={() => this.setState({mealModal: false})}>
              <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Close</Text>
            </TouchableHighlight>
          }
          {!this.state.mealItem.isGroup &&
            <View>
            <View style={{padding: 10}}>
              <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
                onPress={this.cancelRequest}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Cancel Meal</Text>
              </TouchableHighlight>
            </View>
            <View style={{padding: 10}}>
              <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
                onPress={this.rescheduleMeal}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule Meal</Text>
              </TouchableHighlight>
            </View>
            <View style={{padding: 15, alignItems: 'center'}}>
              <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
                onPress={() => this.setState({mealModal: false})}>
                <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Close</Text>
              </TouchableHighlight>
            </View>
            </View>
          }
          {this.state.mealItem.isGroup && userID == this.state.mealItem.initiator &&
            <View>
            <View style={{padding: 10}}>
              <TouchableHighlight style={{padding: 10, backgroundColor: "#d9534f", borderRadius: 5}}
                onPress={this.cancelRequest}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Cancel Meal</Text>
              </TouchableHighlight>
            </View>
            <View style={{padding: 10}}>
              <TouchableHighlight style={{padding: 10, backgroundColor: "#ffbb33", borderRadius: 5}}
                onPress={this.rescheduleGroupMeal}>
                <Text style={{fontSize: 15, fontWeight: 'bold', color: 'white', textAlign: 'center'}}>Reschedule Meal</Text>
              </TouchableHighlight>
            </View>
            <View style={{padding: 15, alignItems: 'center'}}>
              <TouchableHighlight style={{padding: 10, backgroundColor: "#DDDDDD", borderRadius: 5}}
                onPress={() => this.setState({mealModal: false})}>
                <Text style={{fontSize: 15, fontWeight: 'bold', textAlign: 'center'}}>Close</Text>
              </TouchableHighlight>
            </View>
            </View>
          }

        </View>
      </View>
      </Modal>
    </View>
    )
  }

  renderAvatars = () => {
    selectedURLs = []
      for (memberID in this.state.mealItem.members) {
        if (this.state.mealItem.members[memberID].accepted == true) {
          selectedURLs.push(`http://graph.facebook.com/${memberID}/picture?type=normal`)
        }
      }
    return (
      selectedURLs.map((url)=> {
        return <Avatar
            medium
            rounded
            key = {url}
            source={{uri: url}}
            containerStyle = {{margin:5}}
          />
      })
    )
  }

  rescheduleMeal = () => {
    // console.log("reschedule " + this.state.curMeal);
    this.setState({mealModal: false});
    db.collection('users').doc(userID).get().then((doc)=>{
      // let mealID = doc.data().Calendar[this.state.curMeal].eventID;
      this.props.navigation.navigate('FriendChosen', {
        sent: 2,
        reschedule: this.state.curMeal,
        name: this.state.mealItem.FriendName,
        id: this.state.mealItem.FriendID,
        url: `http://graph.facebook.com/${this.state.mealItem.FriendID}/picture?type=large`,
        // mealID: mealID
      });
    })
  }

  rescheduleGroupMeal = () => {
    // console.log("reschedule " + this.state.curMeal);
    this.setState({mealModal: false});
    db.collection('users').doc(userID).get().then((doc)=>{
      // let mealID = doc.data().Calendar[this.state.curMeal].eventID;
      this.props.navigation.navigate('GroupChosen', {
        sent: 2,
        reschedule: this.state.curMeal,
        groupName: this.state.mealItem.groupName,
        members: this.state.mealItem.members,
        id: this.state.curMeal
      });
    })
  }

  cancelRequest = () => {
    console.log(this.state.curMeal)
    curMeal = this.state.curMeal
    console.log(this.state.calendarPermission)

    if (this.state.calendarPermission) {
      db.collection('users').doc(userID).get().then((doc)=>{
        let id = doc.data().Calendar[this.state.curMeal].eventID
        console.log('event id')
        console.log(id)
        Calendar.deleteEventAsync(id)
        console.log('deleting event')
      })
    }
    curMealRef = db.collection("users").doc(userID).collection('Meals').doc(this.state.curMeal)

    curMealRef.get().then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
      } else {
        curMealRefData = doc.data();
        if (curMealRefData && curMealRefData['DateTime']) {
          weekday = weekdays[curMealRefData['DateTime'].getDay()].day
          amPM = curMealRefData['DateTime'].getHours() >= 12 ? "PM" : "AM"
          hours = (curMealRefData['DateTime'].getHours() % 12 || 12) + ":" + ("0" + curMealRefData['DateTime'].getMinutes()).slice(-2) + " " + amPM
          index = data_flip[hours]

          // update freetimes
          freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
          freetimeRef.get().then(function(doc) {
            freetimeData = doc.data();
            freetimeData['Freetime'][index] = 1
              if (curMealRefData['Length'] === 1) {
                freetimeData['Freetime'][index+1] = 1
              }
          // console.log("my data", freetimeData)
          freetimeRef.update(freetimeData).then(() => {
            console.log("My Document updated");
            })
            .catch(function(error) {
              console.error("Error updating", error);
            });
          })

          if (curMealRefData["isGroup"] === true) {
            for (let thisid in curMealRefData["members"]) {
              freetimeRef_other = db.collection("users").doc(thisid).collection('Freetime').doc(weekday);
              freetimeRef_other.get().then(function(doc) {
              freetimeData_other = doc.data();
              freetimeData_other['Freetime'][index] = 1
                if (curMealRefData['Length'] === 1) {
                  freetimeData_other['Freetime'][index+1] = 1
                }
               // console.log(freetimeData_other)
               freetimeRef_other.update(freetimeData_other).then(() => {
              console.log("Document updated");
              })
              .catch(function(error) {
                console.error("Error updating", error);
              });
            })
            }
          } else {
            freetimeRef_other = db.collection("users").doc(curMealRefData["FriendID"]).collection('Freetime').doc(weekday);
            freetimeRef_other.get().then(function(doc) {
              freetimeData_other = doc.data();
              freetimeData_other['Freetime'][index] = 1
                if (curMealRefData['Length'] === 1) {
                  freetimeData_other['Freetime'][index+1] = 1
                }
            // console.log(freetimeData_other)
            freetimeRef_other.update(freetimeData_other).then(() => {
              console.log("Document updated");
              })
              .catch(function(error) {
                console.error("Error updating", error);
              });
            })
          }
        }

      console.log("canceling " + curMeal)
      this.setState({mealModal: false})

      if (curMealRefData["isGroup"] === true) {
        db.collection("users").doc(userID).collection('Meals').doc(curMeal).delete().then(() => {
          console.log("Document successfully deleted!");
          for (let thisid in curMealRefData["members"]) {
          
          db.collection("users").doc(thisid).collection('Meals').doc(curMeal).delete()
          expotoken = "";
          if (thisid !== userID) {
                  db.collection("users").doc(thisid).get().then(function(doc) {
                    expotoken = doc.data().Token;
                    console.log("got token " + expotoken);
  
                    var hours = curMealRefData['DateTime'].getHours();
                    var minutes = curMealRefData['DateTime'].getMinutes();
                    var ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    minutes = minutes < 10 ? '0'+minutes : minutes;
                    var strTime = hours + ':' + minutes + ' ' + ampm;
  
                  if (expotoken !== undefined) {
                    console.log("SENDING NOTIFICATION NEW GROUP MEAL REQUEST FROM " + userName + " to " + thisid);
                  return fetch('https://exp.host/--/api/v2/push/send', {
                    body: JSON.stringify({
                      to: expotoken,
                      //title: "title",
                      body: `${userName} canceled your group meal on ${curMealRefData['DateTime'].toDateString().substring(0,10) + " at " + strTime}!`,
                      data: { message: `${userName} canceled your group meal on ${curMealRefData['DateTime'].toDateString().substring(0,10) + " at " + strTime}!` },
                    }),
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    method: 'POST',
                  });
                  }
                  }).catch(function(error) {
                    console.log("Error getting document:", error);
                  });
                }
                }
        }).catch(function(error) {
          console.error("Error removing document: ", error);
        });
      
      } else {
      db.collection("users").doc(userID).collection('Meals').doc(curMeal).delete().then(() => {
        console.log("Document successfully deleted!");
        db.collection("users").doc(curMealRefData["FriendID"]).collection('Meals').doc(curMeal).delete()
        expotoken = "";
                db.collection("users").doc(curMealRefData["FriendID"]).get().then(function(doc) {
                  expotoken = doc.data().Token;
                  console.log("got token " + expotoken);

                  var hours = curMealRefData['DateTime'].getHours();
                  var minutes = curMealRefData['DateTime'].getMinutes();
                  var ampm = hours >= 12 ? 'PM' : 'AM';
                  hours = hours % 12;
                  hours = hours ? hours : 12; // the hour '0' should be '12'
                  minutes = minutes < 10 ? '0'+minutes : minutes;
                  var strTime = hours + ':' + minutes + ' ' + ampm;

                if (expotoken !== undefined) {
                  console.log("SENDING NOTIFICATION NEW GROUP MEAL REQUEST FROM " + userName + " to " + curMealRefData["FriendID"]);
                return fetch('https://exp.host/--/api/v2/push/send', {
                  body: JSON.stringify({
                    to: expotoken,
                    //title: "title",
                    body: `${userName} canceled your meal on ${curMealRefData['DateTime'].toDateString().substring(0,10) + " at " + strTime}!`,
                    data: { message: `${userName} canceled your meal on ${curMealRefData['DateTime'].toDateString().substring(0,10) + " at " + strTime}!` },
                  }),
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  method: 'POST',
                });
                }
                }).catch(function(error) {
                  console.log("Error getting document:", error);
                });
      }).catch(function(error) {
        console.error("Error removing document: ", error);
      });
      }
    }
    }).catch(function(error) {
       console.error("Error updating freetime: ", error);
    });
  }

}

const styles = StyleSheet.create({
  item: {
    // backgroundColor: '#f9a56a',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
    flexDirection:'row'
  },
  empty: {
    backgroundColor: '#dfe6e9',
    flex: 1,
    borderRadius: 5,
    // padding: 10,
    marginRight: 10,
    marginTop: 40,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent:'center'
  },
});

// onRefresh = () => {
//   this.setState({refreshing: true});
//   db.collection("users").doc(userID).collection('Meals').get().then((querySnapshot) => {
//     meals = [];
//     querySnapshot.forEach((doc) => {
//       today = new Date()
//       today.setHours(0, 0, 0, 0)
//       if (doc.data().DateTime >= today) {
//         if (!doc.data().inCalendar) {
//           meal = doc.data()
//           meal.docid = doc.id
//           this.addToCalendar(meal)
//         }
//         meals.push(doc.data());
//         meals[meals.length-1]['docid'] = doc.id;
//       } else {
//         //console.log("MEAL HAS PASSED: " + doc.data().DateTime);
//         // TODO convert meal back to freetime in array
//         weekday = weekdays[doc.data().DateTime.getDay()].day
//         freetimeRef = db.collection("users").doc(userID).collection('Freetime').doc(weekday);
//         freetimeRef.get().then(function(doc) {
//           freetimeData = doc.data();
//           for (i = 0; i < freetimeData['Freetime'].length; i++) {
//             if (freetimeData['Freetime'][i] === 2) {
//               freetimeData['Freetime'][i] = 1
//             }
//           }
//         freetimeRef.set(freetimeData).then(() => {
//           // console.log("My Document updated");
//           })
//           .catch(function(error) {
//             // console.error("Error updating", error);
//           });
//         })
//         db.collection("users").doc(userID).collection('Meals').doc(doc.id).delete().then(() => {
//           //console.log("Document successfully deleted!");
//           db.collection("users").doc(doc.data().FriendID).collection('Meals').doc(doc.id).delete()
//         }).catch(function(error) {
//           // console.error("Error removing document: ", error);
//         });
//       }
//     });
//     if (meals.length == 0) {
//       updatedItems = this.createEmptyData()
//       this.setState((prevState) => {
//         return {items: updatedItems}
//       });
//     }
//     //console.log(meals)
//     //console.log("M0 " + meals[0].docid);
//     this.updateItems(meals);
//     //console.log("M01 " + meals[0].docid);
//   });
//   this.setState({refreshing: false});
// }
// if (Platform.OS === 'ios') {
//   sources = await Calendar.getSourcesAsync()
//   console.log(sources)
//   details = {
//     title: 'Meals',
//     color: 'red',
//     entityType: Calendar.EntityTypes.EVENT,
//     sourceId: "BC0A78C9-A559-451D-BD4F-A8EC143C399A"
//   }
// }
// else
//   details = {
//     accessLevel: "owner",
//     allowedAttendeeTypes: [
//       "none",
//       "required",
//       "optional",
//     ],
//     allowedAvailabilities: [
//       "busy",
//       "free",
//     ],
//     allowedReminders: [
//       "default",
//       "alert",
//       "email",
//     ],
//     color: "red",
//     isSynced: true,
//     isVisible: true,
//     name: "Meals",
//     ownerAccount: "MealUp",
//     source: {
//       isLocalAccount: true,
//       name: "MealUp",
//     },
//     title: "Meals",
//   }
// calID = await Calendar.createCalendarAsync(details)
// this.setState({calID:calID})
