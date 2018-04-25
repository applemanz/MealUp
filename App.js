import React, { Component } from 'react';
import { Platform, StatusBar, StyleSheet, View, AsyncStorage } from 'react-native';
import { AppLoading, Asset, Font } from 'expo';
import { Ionicons } from '@expo/vector-icons';
import RootNavigation from './src/navigation/RootNavigation';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      isLoadingComplete: false,
    }
  }

  render() {
    if (!this.state.isLoadingComplete && !this.props.skipLoadingScreen) {
      return (
        <AppLoading
          startAsync={this._loadResourcesAsync}
          onError={this._handleLoadingError}
          onFinish={this._handleFinishLoading}
        />
      );
    } else {
      return (
        <View style={styles.container}>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
          <RootNavigation/>
        </View>
      );
    }
  }

  _loadResourcesAsync = async () => {
    await Asset.loadAsync([require('./assets/images/signin_logo_circle.png')]);
    // try {
    //   const value = await AsyncStorage.getItem('loggedIn');
    //   if (value !== null){
    //     console.log(value);
    //     this.setState({loggedIn:value})
    //   }
    // } catch (error) {
    //   // Error retrieving data
    // }
  };

  _handleLoadingError = error => {
    // In this case, you might want to report the error to your error
    // reporting service, for example Sentry
    console.warn(error);
  };

  _handleFinishLoading = () => {
    this.setState({ isLoadingComplete: true });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});
