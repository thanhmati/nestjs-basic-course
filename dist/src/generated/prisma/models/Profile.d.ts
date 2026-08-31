import type * as runtime from '@prisma/client/runtime/client';
import type * as Prisma from '../internal/prismaNamespace.js';
export type ProfileModel = runtime.Types.Result.DefaultSelection<Prisma.$ProfilePayload>;
export type AggregateProfile = {
    _count: ProfileCountAggregateOutputType | null;
    _avg: ProfileAvgAggregateOutputType | null;
    _sum: ProfileSumAggregateOutputType | null;
    _min: ProfileMinAggregateOutputType | null;
    _max: ProfileMaxAggregateOutputType | null;
};
export type ProfileAvgAggregateOutputType = {
    id: number | null;
    userId: number | null;
};
export type ProfileSumAggregateOutputType = {
    id: number | null;
    userId: number | null;
};
export type ProfileMinAggregateOutputType = {
    id: number | null;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: number | null;
};
export type ProfileMaxAggregateOutputType = {
    id: number | null;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    userId: number | null;
};
export type ProfileCountAggregateOutputType = {
    id: number;
    bio: number;
    avatarUrl: number;
    location: number;
    createdAt: number;
    updatedAt: number;
    userId: number;
    _all: number;
};
export type ProfileAvgAggregateInputType = {
    id?: true;
    userId?: true;
};
export type ProfileSumAggregateInputType = {
    id?: true;
    userId?: true;
};
export type ProfileMinAggregateInputType = {
    id?: true;
    bio?: true;
    avatarUrl?: true;
    location?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
};
export type ProfileMaxAggregateInputType = {
    id?: true;
    bio?: true;
    avatarUrl?: true;
    location?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
};
export type ProfileCountAggregateInputType = {
    id?: true;
    bio?: true;
    avatarUrl?: true;
    location?: true;
    createdAt?: true;
    updatedAt?: true;
    userId?: true;
    _all?: true;
};
export type ProfileAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProfileWhereInput;
    orderBy?: Prisma.ProfileOrderByWithRelationInput | Prisma.ProfileOrderByWithRelationInput[];
    cursor?: Prisma.ProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ProfileCountAggregateInputType;
    _avg?: ProfileAvgAggregateInputType;
    _sum?: ProfileSumAggregateInputType;
    _min?: ProfileMinAggregateInputType;
    _max?: ProfileMaxAggregateInputType;
};
export type GetProfileAggregateType<T extends ProfileAggregateArgs> = {
    [P in keyof T & keyof AggregateProfile]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProfile[P]> : Prisma.GetScalarType<T[P], AggregateProfile[P]>;
};
export type ProfileGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProfileWhereInput;
    orderBy?: Prisma.ProfileOrderByWithAggregationInput | Prisma.ProfileOrderByWithAggregationInput[];
    by: Prisma.ProfileScalarFieldEnum[] | Prisma.ProfileScalarFieldEnum;
    having?: Prisma.ProfileScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProfileCountAggregateInputType | true;
    _avg?: ProfileAvgAggregateInputType;
    _sum?: ProfileSumAggregateInputType;
    _min?: ProfileMinAggregateInputType;
    _max?: ProfileMaxAggregateInputType;
};
export type ProfileGroupByOutputType = {
    id: number;
    bio: string | null;
    avatarUrl: string | null;
    location: string | null;
    createdAt: Date;
    updatedAt: Date;
    userId: number;
    _count: ProfileCountAggregateOutputType | null;
    _avg: ProfileAvgAggregateOutputType | null;
    _sum: ProfileSumAggregateOutputType | null;
    _min: ProfileMinAggregateOutputType | null;
    _max: ProfileMaxAggregateOutputType | null;
};
export type GetProfileGroupByPayload<T extends ProfileGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProfileGroupByOutputType, T['by']> & {
    [P in keyof T & keyof ProfileGroupByOutputType]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProfileGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProfileGroupByOutputType[P]>;
}>>;
export type ProfileWhereInput = {
    AND?: Prisma.ProfileWhereInput | Prisma.ProfileWhereInput[];
    OR?: Prisma.ProfileWhereInput[];
    NOT?: Prisma.ProfileWhereInput | Prisma.ProfileWhereInput[];
    id?: Prisma.IntFilter<'Profile'> | number;
    bio?: Prisma.StringNullableFilter<'Profile'> | string | null;
    avatarUrl?: Prisma.StringNullableFilter<'Profile'> | string | null;
    location?: Prisma.StringNullableFilter<'Profile'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'Profile'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'Profile'> | Date | string;
    userId?: Prisma.IntFilter<'Profile'> | number;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
};
export type ProfileOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    bio?: Prisma.SortOrderInput | Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    location?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
};
export type ProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    userId?: number;
    AND?: Prisma.ProfileWhereInput | Prisma.ProfileWhereInput[];
    OR?: Prisma.ProfileWhereInput[];
    NOT?: Prisma.ProfileWhereInput | Prisma.ProfileWhereInput[];
    bio?: Prisma.StringNullableFilter<'Profile'> | string | null;
    avatarUrl?: Prisma.StringNullableFilter<'Profile'> | string | null;
    location?: Prisma.StringNullableFilter<'Profile'> | string | null;
    createdAt?: Prisma.DateTimeFilter<'Profile'> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<'Profile'> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
}, 'id' | 'userId'>;
export type ProfileOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    bio?: Prisma.SortOrderInput | Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    location?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    _count?: Prisma.ProfileCountOrderByAggregateInput;
    _avg?: Prisma.ProfileAvgOrderByAggregateInput;
    _max?: Prisma.ProfileMaxOrderByAggregateInput;
    _min?: Prisma.ProfileMinOrderByAggregateInput;
    _sum?: Prisma.ProfileSumOrderByAggregateInput;
};
export type ProfileScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProfileScalarWhereWithAggregatesInput | Prisma.ProfileScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProfileScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProfileScalarWhereWithAggregatesInput | Prisma.ProfileScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<'Profile'> | number;
    bio?: Prisma.StringNullableWithAggregatesFilter<'Profile'> | string | null;
    avatarUrl?: Prisma.StringNullableWithAggregatesFilter<'Profile'> | string | null;
    location?: Prisma.StringNullableWithAggregatesFilter<'Profile'> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<'Profile'> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<'Profile'> | Date | string;
    userId?: Prisma.IntWithAggregatesFilter<'Profile'> | number;
};
export type ProfileCreateInput = {
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutProfileInput;
};
export type ProfileUncheckedCreateInput = {
    id?: number;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId: number;
};
export type ProfileUpdateInput = {
    bio?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutProfileNestedInput;
};
export type ProfileUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    bio?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ProfileCreateManyInput = {
    id?: number;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    userId: number;
};
export type ProfileUpdateManyMutationInput = {
    bio?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProfileUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    bio?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type ProfileNullableScalarRelationFilter = {
    is?: Prisma.ProfileWhereInput | null;
    isNot?: Prisma.ProfileWhereInput | null;
};
export type ProfileCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    bio?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProfileAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProfileMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    bio?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProfileMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    bio?: Prisma.SortOrder;
    avatarUrl?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProfileSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
};
export type ProfileCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ProfileCreateWithoutUserInput, Prisma.ProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfileCreateOrConnectWithoutUserInput;
    connect?: Prisma.ProfileWhereUniqueInput;
};
export type ProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: Prisma.XOR<Prisma.ProfileCreateWithoutUserInput, Prisma.ProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfileCreateOrConnectWithoutUserInput;
    connect?: Prisma.ProfileWhereUniqueInput;
};
export type ProfileUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ProfileCreateWithoutUserInput, Prisma.ProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfileCreateOrConnectWithoutUserInput;
    upsert?: Prisma.ProfileUpsertWithoutUserInput;
    disconnect?: Prisma.ProfileWhereInput | boolean;
    delete?: Prisma.ProfileWhereInput | boolean;
    connect?: Prisma.ProfileWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProfileUpdateToOneWithWhereWithoutUserInput, Prisma.ProfileUpdateWithoutUserInput>, Prisma.ProfileUncheckedUpdateWithoutUserInput>;
};
export type ProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.ProfileCreateWithoutUserInput, Prisma.ProfileUncheckedCreateWithoutUserInput>;
    connectOrCreate?: Prisma.ProfileCreateOrConnectWithoutUserInput;
    upsert?: Prisma.ProfileUpsertWithoutUserInput;
    disconnect?: Prisma.ProfileWhereInput | boolean;
    delete?: Prisma.ProfileWhereInput | boolean;
    connect?: Prisma.ProfileWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProfileUpdateToOneWithWhereWithoutUserInput, Prisma.ProfileUpdateWithoutUserInput>, Prisma.ProfileUncheckedUpdateWithoutUserInput>;
};
export type ProfileCreateWithoutUserInput = {
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProfileUncheckedCreateWithoutUserInput = {
    id?: number;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProfileCreateOrConnectWithoutUserInput = {
    where: Prisma.ProfileWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProfileCreateWithoutUserInput, Prisma.ProfileUncheckedCreateWithoutUserInput>;
};
export type ProfileUpsertWithoutUserInput = {
    update: Prisma.XOR<Prisma.ProfileUpdateWithoutUserInput, Prisma.ProfileUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.ProfileCreateWithoutUserInput, Prisma.ProfileUncheckedCreateWithoutUserInput>;
    where?: Prisma.ProfileWhereInput;
};
export type ProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: Prisma.ProfileWhereInput;
    data: Prisma.XOR<Prisma.ProfileUpdateWithoutUserInput, Prisma.ProfileUncheckedUpdateWithoutUserInput>;
};
export type ProfileUpdateWithoutUserInput = {
    bio?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProfileUncheckedUpdateWithoutUserInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    bio?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    avatarUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    location?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProfileSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    bio?: boolean;
    avatarUrl?: boolean;
    location?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs['result']['profile']>;
export type ProfileSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    bio?: boolean;
    avatarUrl?: boolean;
    location?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs['result']['profile']>;
export type ProfileSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    bio?: boolean;
    avatarUrl?: boolean;
    location?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs['result']['profile']>;
export type ProfileSelectScalar = {
    id?: boolean;
    bio?: boolean;
    avatarUrl?: boolean;
    location?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    userId?: boolean;
};
export type ProfileOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<'id' | 'bio' | 'avatarUrl' | 'location' | 'createdAt' | 'updatedAt' | 'userId', ExtArgs['result']['profile']>;
export type ProfileInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ProfileIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type ProfileIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $ProfilePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: 'Profile';
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        bio: string | null;
        avatarUrl: string | null;
        location: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }, ExtArgs['result']['profile']>;
    composites: {};
};
export type ProfileGetPayload<S extends boolean | null | undefined | ProfileDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProfilePayload, S>;
export type ProfileCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProfileCountAggregateInputType | true;
};
export interface ProfileDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Profile'];
        meta: {
            name: 'Profile';
        };
    };
    findUnique<T extends ProfileFindUniqueArgs>(args: Prisma.SelectSubset<T, ProfileFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'findUnique', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ProfileFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ProfileFindFirstArgs>(args?: Prisma.SelectSubset<T, ProfileFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'findFirst', GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ProfileFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'findFirstOrThrow', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ProfileFindManyArgs>(args?: Prisma.SelectSubset<T, ProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'findMany', GlobalOmitOptions>>;
    create<T extends ProfileCreateArgs>(args: Prisma.SelectSubset<T, ProfileCreateArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'create', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ProfileCreateManyArgs>(args?: Prisma.SelectSubset<T, ProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ProfileCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'createManyAndReturn', GlobalOmitOptions>>;
    delete<T extends ProfileDeleteArgs>(args: Prisma.SelectSubset<T, ProfileDeleteArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'delete', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ProfileUpdateArgs>(args: Prisma.SelectSubset<T, ProfileUpdateArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'update', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ProfileDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ProfileUpdateManyArgs>(args: Prisma.SelectSubset<T, ProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ProfileUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'updateManyAndReturn', GlobalOmitOptions>>;
    upsert<T extends ProfileUpsertArgs>(args: Prisma.SelectSubset<T, ProfileUpsertArgs<ExtArgs>>): Prisma.Prisma__ProfileClient<runtime.Types.Result.GetResult<Prisma.$ProfilePayload<ExtArgs>, T, 'upsert', GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ProfileCountArgs>(args?: Prisma.Subset<T, ProfileCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProfileCountAggregateOutputType> : number>;
    aggregate<T extends ProfileAggregateArgs>(args: Prisma.Subset<T, ProfileAggregateArgs>): Prisma.PrismaPromise<GetProfileAggregateType<T>>;
    groupBy<T extends ProfileGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends (Prisma.True extends HasSelectOrTake ? {
        orderBy: ProfileGroupByArgs['orderBy'];
    } : {
        orderBy?: ProfileGroupByArgs['orderBy'];
    }), OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends (T['by'] extends never[] ? Prisma.True : Prisma.False), InputErrors extends (ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields])>(args: Prisma.SubsetIntersection<T, ProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ProfileFieldRefs;
}
export interface Prisma__ProfileClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: 'PrismaPromise';
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, 'findUniqueOrThrow', GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ProfileFieldRefs {
    readonly id: Prisma.FieldRef<'Profile', 'Int'>;
    readonly bio: Prisma.FieldRef<'Profile', 'String'>;
    readonly avatarUrl: Prisma.FieldRef<'Profile', 'String'>;
    readonly location: Prisma.FieldRef<'Profile', 'String'>;
    readonly createdAt: Prisma.FieldRef<'Profile', 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<'Profile', 'DateTime'>;
    readonly userId: Prisma.FieldRef<'Profile', 'Int'>;
}
export type ProfileFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    where: Prisma.ProfileWhereUniqueInput;
};
export type ProfileFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    where: Prisma.ProfileWhereUniqueInput;
};
export type ProfileFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    where?: Prisma.ProfileWhereInput;
    orderBy?: Prisma.ProfileOrderByWithRelationInput | Prisma.ProfileOrderByWithRelationInput[];
    cursor?: Prisma.ProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProfileScalarFieldEnum | Prisma.ProfileScalarFieldEnum[];
};
export type ProfileFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    where?: Prisma.ProfileWhereInput;
    orderBy?: Prisma.ProfileOrderByWithRelationInput | Prisma.ProfileOrderByWithRelationInput[];
    cursor?: Prisma.ProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProfileScalarFieldEnum | Prisma.ProfileScalarFieldEnum[];
};
export type ProfileFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    where?: Prisma.ProfileWhereInput;
    orderBy?: Prisma.ProfileOrderByWithRelationInput | Prisma.ProfileOrderByWithRelationInput[];
    cursor?: Prisma.ProfileWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProfileScalarFieldEnum | Prisma.ProfileScalarFieldEnum[];
};
export type ProfileCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProfileCreateInput, Prisma.ProfileUncheckedCreateInput>;
};
export type ProfileCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ProfileCreateManyInput | Prisma.ProfileCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ProfileCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    data: Prisma.ProfileCreateManyInput | Prisma.ProfileCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ProfileIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ProfileUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProfileUpdateInput, Prisma.ProfileUncheckedUpdateInput>;
    where: Prisma.ProfileWhereUniqueInput;
};
export type ProfileUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ProfileUpdateManyMutationInput, Prisma.ProfileUncheckedUpdateManyInput>;
    where?: Prisma.ProfileWhereInput;
    limit?: number;
};
export type ProfileUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProfileUpdateManyMutationInput, Prisma.ProfileUncheckedUpdateManyInput>;
    where?: Prisma.ProfileWhereInput;
    limit?: number;
    include?: Prisma.ProfileIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ProfileUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    where: Prisma.ProfileWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProfileCreateInput, Prisma.ProfileUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ProfileUpdateInput, Prisma.ProfileUncheckedUpdateInput>;
};
export type ProfileDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
    where: Prisma.ProfileWhereUniqueInput;
};
export type ProfileDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProfileWhereInput;
    limit?: number;
};
export type ProfileDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProfileSelect<ExtArgs> | null;
    omit?: Prisma.ProfileOmit<ExtArgs> | null;
    include?: Prisma.ProfileInclude<ExtArgs> | null;
};
