import {LocalStorage} from "quasar";

export default function storeToLocalStorage (context) {
  const storeId = context.store.$id
  if(storeId === 'page') {
    const localItem = LocalStorage.getItem(storeId)

    if(localItem){
      context.store.$patch(localItem);
    }

    context.store.$subscribe((mutation, state) => {
      LocalStorage.setItem(storeId, state);
    })
  }
}
