import React, {useState, useEffect} from 'react';
import {View, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import auth from '@react-native-firebase/auth';
import {Button, Input, Text} from 'react-native-elements';
import {SocialIcon} from 'react-native-elements/dist/social/SocialIcon';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Avatar} from 'react-native-elements/dist/avatar/Avatar';
import firestore from '@react-native-firebase/firestore';
import CheckBox from '@react-native-community/checkbox';

GoogleSignin.configure();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 8,
    marginBottom: 60,
  },
  button: {
    marginTop: 8,
  },
  socialButton: {
    paddingHorizontal: 20,
  },
  avatar: {
    backgroundColor: '#BCBEC1',
  },
  todoItem: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  todoItemCheckbox: {
    marginRight: 8,
    height: 20,
    width: 20,
  },
  todoItemText: {
    flex: 1,
  },
  signOut: {
    marginTop: 60,
  },
});

type CenteredProps = {
  children: React.ReactNode;
};

type Todo = {
  id: string;
  title?: string;
  isDone?: boolean;
};

const Centered = ({children}: CenteredProps) => (
  <View style={styles.container}>{children}</View>
);

type User = {
  displayName: string | null | undefined;
  email: string | null | undefined;
  photoURL: string | null | undefined;
};

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [formState, setFormState] = useState<{email: string; password: string}>(
    {
      email: '',
      password: '',
    },
  );
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    async function getTodos() {
      const data = await firestore().collection('todos');

      data.onSnapshot((snapshot) => {
        const computed = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log('computed:', computed);
        setTodos(computed);
      });
    }

    getTodos();

    const unsubscribe = firestore()
      .collection('todos')
      .doc('9ipaPs3gZBpp9FW5JnQD')
      .onSnapshot((newData) => {
        console.log('newData:', newData);
      });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((userState) => {
      if (userState) {
        setUser({
          displayName: userState?.displayName,
          email: userState?.email,
          photoURL: userState?.photoURL,
        });
      }
    });

    setLoading(false);

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    if (!formState.email || !formState.password) {
      Alert.alert('all fields required!');
      return;
    }

    setSubmitLoading(true);
    auth()
      .signInWithEmailAndPassword(formState.email, formState.password)
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  const handleSignup = () => {
    if (!formState.email || !formState.password) {
      Alert.alert('all fields required!');
      return;
    }

    auth()
      .createUserWithEmailAndPassword(formState.email, formState.password)
      .then(() => {
        setIsCreatingAccount(false);
      });
  };

  const handleGoogleSigin = async () => {
    await GoogleSignin.hasPlayServices();
    const data = await GoogleSignin.signIn();
    setUser({
      displayName: data.user.name,
      email: data.user.email,
      photoURL: data.user.photo,
    });
  };

  const handleSignout = () => {
    auth()
      .signOut()
      .catch((error) => {
        if (error.code === 'auth/no-current-user') {
          setUser(null);
        }
      });
  };

  const toggleTodo = (todo: Todo) => {
    setTodos((prevState) =>
      prevState.map((item) =>
        item.id === todo.id ? {...todo, isDone: !todo.isDone} : todo,
      ),
    );
    // firestore().collection('todos').doc(todo.id).update({isDone: !todo.isDone});
  };

  if (loading) {
    return null;
  }

  if (isCreatingAccount) {
    return (
      <Centered>
        <Text h3 style={styles.title}>
          Create and account
        </Text>
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, email: text}))
          }
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="e-mail"
          leftIcon={{name: 'email'}}
        />
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, password: text}))
          }
          secureTextEntry
          placeholder="password"
          leftIcon={{name: 'lock'}}
        />
        <Button
          style={styles.button}
          loading={submitLoading}
          onPress={handleSignup}
          title="Sign up"
        />

        <Button
          style={styles.button}
          title="Go back"
          onPress={() => setIsCreatingAccount(false)}
        />
      </Centered>
    );
  }

  if (!user) {
    return (
      <Centered>
        <Text h3 style={styles.title}>
          Login
        </Text>
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, email: text}))
          }
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="e-mail"
          leftIcon={{name: 'email'}}
        />
        <Input
          onChangeText={(text) =>
            setFormState((prevState) => ({...prevState, password: text}))
          }
          secureTextEntry
          placeholder="password"
          leftIcon={{name: 'lock'}}
        />
        <Button
          style={styles.button}
          onPress={handleLogin}
          loading={submitLoading}
          title="Sign in"
        />
        <SocialIcon
          raised
          iconType="font-awesome"
          iconColor="white"
          iconSize={24}
          onPress={handleGoogleSigin}
          style={styles.socialButton}
          title="Sign In With Google"
          button
          type="google"
        />
        <Button
          style={styles.button}
          onPress={() => setIsCreatingAccount(true)}
          title="Create an account"
        />
      </Centered>
    );
  }

  return (
    <Centered>
      <Avatar
        containerStyle={styles.avatar}
        rounded
        icon={{name: 'home'}}
        source={user.photoURL ? {uri: user.photoURL} : {}}
      />

      <Text style={styles.title}>
        Welcome {user.displayName || user.email}!
      </Text>
      <Text h2 style={styles.title}>
        Your todos!
      </Text>
      {todos.map((todo) => (
        <TouchableOpacity
          onPress={() => toggleTodo(todo)}
          style={styles.todoItem}
          key={todo.id}>
          <CheckBox
            style={styles.todoItemCheckbox}
            boxType="square"
            value={todo.isDone}
          />
          <Text style={styles.todoItemText}>{todo.title}</Text>
        </TouchableOpacity>
      ))}

      <Button style={styles.signOut} onPress={handleSignout} title="Sign out" />
    </Centered>
  );
}

export default App;
