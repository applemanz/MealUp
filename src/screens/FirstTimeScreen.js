import React, {Component} from 'react';
import {Text, View, StyleSheet, Platform, TouchableHighlight, Modal, Button, Image} from 'react-native';
import {Agenda} from 'react-native-calendars';
import firebase from "../config/firebase";
import { userName, userID } from './SignInScreen';
import Onboarding from 'react-native-onboarding-swiper';
const db = firebase.firestore();

export default class FirstTimeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      title: 'FirstTime',
    };
  };

  constructor(props) {
    super(props);
  }

  render() {
    const { params } = this.props.navigation.state;
    // const firstTime = params ? params.firstTime : null;
    if (Platform.OS === 'ios') {
      return (
          <Onboarding
            pages={[
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/iOS/ios_welcome.png')}
                 style={{width:175, height:356, opacity: 0.85, alignItems: 'center',
                  shadowColor:'#d1c7c7', shadowOffset: {width: 0, height: 2}, shadowRadius: 2}}/>,
                title: 'Welcome to MealUp!',
                subtitle: 'Meet up & eat up with friends easily. Swipe to learn how.',
              },
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/iOS/ios_freetime.png')} 
                  style={{width:175, height:356, opacity: 0.85, alignItems: 'center'}}/>,
                title: 'Manage your free time',
                subtitle: 'Edit your schedule anytime and anywhere.',
              },
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/iOS/ios_requests.png')} 
                  style={{width:286, height:346, opacity: 0.85, alignItems: 'center'}}/>,
                title: 'Schedule Meals',
                subtitle: 'Send and respond to meal requests.',
              },
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/iOS/ios_groups.png')} 
                  style={{width:286, height:346, opacity: 0.85, alignItems: 'center'}}/>,
                title: 'Organize Groups',
                subtitle: 'Connect to your friends more with groups.',
              },
            ]}
            onDone = {() => {this.props.navigation.navigate('Meals')}}
            onSkip = {() => {this.props.navigation.navigate('Meals')}}
          />
        )
    } else if (Platform.OS === 'android') {
      return (
          <Onboarding
            pages={[
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/robot-prod.png')} />,
                title: 'Welcome to MealUp!',
                subtitle: 'Meet up & eat up with friends easily. Swipe to learn how.',
              },
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/robot-dev.png')} />,
                title: 'Manage your free time',
                subtitle: 'Edit your schedule anytime and anywhere.',
              },
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/robot-dev.png')} />,
                title: 'Schedule Meals',
                subtitle: 'Send and respond to meal requests.',
              },
              {
                backgroundColor: '#fff',
                image: <Image source={require('../../assets/images/robot-dev.png')} />,
                title: 'Organize Groups',
                subtitle: 'Connect more with groups.',
              },
            ]}
            onDone = {() => {this.props.navigation.navigate('Meals')}}
            onSkip = {() => {this.props.navigation.navigate('Meals')}}
          />
      )} else {
        console.error("error loading", error);
      }
    }
  }


const styles = StyleSheet.create({
  item: {
    backgroundColor: '#f9a56a',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
  empty: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17
  },
});

