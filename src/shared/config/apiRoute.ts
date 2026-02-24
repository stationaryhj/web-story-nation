export const apiRoute = {
  charbot: {
    inprogress: {
      get: '/api/charbot/inprogress/get',
      save: '/api/charbot/inprogress/save',
      saveMultiImage: '/api/charbot/inprogress/save/multiimagedata',
      saveTag: '/api/charbot/inprogress/save/tag',
      deleteMultiImage: '/api/charbot/inprogress/delete/multiimagedata',
    },
    tag: {
      get: '/api/charbot/tag/get',
    },
  },
} as const
