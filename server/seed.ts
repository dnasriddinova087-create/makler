import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding IJARA.UZ database...');

  // 1. Clean existing records in safe order
  await prisma.handoverAct.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.viewing.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.mahalla.deleteMany();
  await prisma.district.deleteMany();
  await prisma.region.deleteMany();

  // 2. Amenities
  const amenitiesData = [
    { name: 'Wi-Fi Internet', iconKey: 'wifi' },
    { name: 'Konditsioner', iconKey: 'air-vent' },
    { name: 'Muzlatkich', iconKey: 'refrigerator' },
    { name: 'Kir yuvish mashinasi', iconKey: 'washing-machine' },
    { name: 'Zamonaviy lift', iconKey: 'arrow-up-down' },
    { name: 'Avtoturargoh', iconKey: 'car' },
    { name: 'Televizor Smart TV', iconKey: 'tv' },
    { name: 'Mikroto‘lqinli pech', iconKey: 'microwave' },
    { name: 'Gaz / Elektr plita', iconKey: 'flame' },
    { name: 'Bolalar maydonchasi', iconKey: 'baby' },
    { name: '24/7 Qo‘riqlash tizimi', iconKey: 'shield-check' },
    { name: 'Balkon / Terassa', iconKey: 'sun' }
  ];

  const amenityMap: Record<string, string> = {};
  for (const item of amenitiesData) {
    const am = await prisma.amenity.create({ data: item });
    amenityMap[item.name] = am.id;
  }

  // 3. Regions & Districts & Mahallas
  const regionsData = [
    {
      nameUz: 'Toshkent shahri',
      code: 'TAS_CITY',
      districts: [
        {
          nameUz: 'Chilonzor tumani',
          mahallas: ['1-mavze', 'Navbahor', 'Katta Chilonzor', 'Do‘mbirobod', 'Cho‘ponota']
        },
        {
          nameUz: 'Yunusobod tumani',
          mahallas: ['Shahriston', '11-mavze', 'Oloy bozor', 'Markaz-4', 'Mingchinor']
        },
        {
          nameUz: 'Mirzo Ulug‘bek tumani',
          mahallas: ['Buyuk Ipak Yo‘li', 'Oqqo‘rg‘on', 'Qorasuv-1', 'Gulsanam', 'Yalang‘och']
        },
        {
          nameUz: 'Yakkasaroy tumani',
          mahallas: ['Rakat', 'Boshliq', 'Qushbegi', 'Muqimiy', 'Teatral']
        },
        {
          nameUz: 'Mirobod tumani',
          mahallas: ['Oybek', 'Mirobod', 'Tong yulduzi', 'Salar', 'Sariko‘l']
        },
        {
          nameUz: 'Shayxontohur tumani',
          mahallas: ['Chorsu', 'Samarqand Darvoza', 'Ibn Sino', 'Ko‘kcha', 'Labzak']
        }
      ]
    },
    {
      nameUz: 'Toshkent viloyati',
      code: 'TAS_REG',
      districts: [
        {
          nameUz: 'Qibray tumani',
          mahallas: ['Baytqo‘rg‘on', 'Salor', 'ToshGRES']
        },
        {
          nameUz: 'Chirchiq shahri',
          mahallas: ['Navro‘z', 'Guliston', 'Lola']
        },
        {
          nameUz: 'Bo‘stonliq tumani',
          mahallas: ['G‘azalkent', 'Charvoq', 'Chimyiyon']
        }
      ]
    },
    {
      nameUz: 'Samarqand viloyati',
      code: 'SAM',
      districts: [
        {
          nameUz: 'Samarqand shahri',
          mahallas: ['Registon', 'Siyob', 'Universitet xiyoboni', 'Bog‘ishamol']
        },
        {
          nameUz: 'Pastdarg‘om tumani',
          mahallas: ['Juma', 'Go‘zalkent']
        }
      ]
    },
    {
      nameUz: 'Buxoro viloyati',
      code: 'BUX',
      districts: [
        {
          nameUz: 'Buxoro shahri',
          mahallas: ['Labi Hovuz', 'Somoniylar', 'Kogon yo‘li']
        }
      ]
    },
    {
      nameUz: 'Farg‘ona viloyati',
      code: 'FER',
      districts: [
        {
          nameUz: 'Farg‘ona shahri',
          mahallas: ['Markaz', 'Al-Farg‘oniy', 'Qirguli']
        }
      ]
    }
  ];

  const districtMap: Record<string, string> = {};
  const mahallaMap: Record<string, string> = {};
  const regionMap: Record<string, string> = {};

  for (const reg of regionsData) {
    const createdReg = await prisma.region.create({
      data: {
        nameUz: reg.nameUz,
        code: reg.code
      }
    });
    regionMap[reg.nameUz] = createdReg.id;

    for (const dist of reg.districts) {
      const createdDist = await prisma.district.create({
        data: {
          regionId: createdReg.id,
          nameUz: dist.nameUz
        }
      });
      districtMap[dist.nameUz] = createdDist.id;

      for (const mah of dist.mahallas) {
        const createdMah = await prisma.mahalla.create({
          data: {
            districtId: createdDist.id,
            nameUz: mah
          }
        });
        mahallaMap[`${dist.nameUz}_${mah}`] = createdMah.id;
      }
    }
  }

  // 4. Users (CLIENT, BROKER, ADMIN)
  const passwordHash = await bcrypt.hash('ijara123', 10);
  const adminPasswordHash = await bcrypt.hash('admin123', 10);

  // Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ijara.uz',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      firstName: 'Alisher',
      lastName: 'Rahmonov',
      phone: '+998901234567',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isVerified: true
    }
  });

  // Broker 1 (Dilfuza Nasriddinova - Top Verified Broker)
  const broker1 = await prisma.user.create({
    data: {
      email: 'dnasriddinova087@gmail.com',
      passwordHash,
      role: 'BROKER',
      firstName: 'Dilfuza',
      lastName: 'Nasriddinova',
      phone: '+998935551234',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      profile: {
        create: {
          bio: 'Toshkent shahri markaziy va qulay tumanlarida 6 yillik tajribaga ega sertifikatlangan ko‘chmas mulk mutaxassisi. Xavfsiz shartnomalar va ishonchli xonadonlar.',
          experienceYears: 6,
          companyName: 'Grand Real Estate Tashkent',
          specialization: 'Premium kvartiralar, yangi qurilgan uylar',
          telegram: '@dilfuza_makler',
          whatsapp: '+998935551234',
          ratingAvg: 4.95,
          totalDeals: 148,
          responseTimeMin: 10
        }
      },
      verification: {
        create: {
          status: 'VERIFIED',
          documentNumber: 'AA1234567',
          verifiedAt: new Date(),
          reviewerNote: 'Hujjatlar to‘liq tekshirildi va tasdiqlandi.'
        }
      }
    }
  });

  // Broker 2 (Rustam Karimov)
  const broker2 = await prisma.user.create({
    data: {
      email: 'rustam@ijara.uz',
      passwordHash,
      role: 'BROKER',
      firstName: 'Rustam',
      lastName: 'Karimov',
      phone: '+998977778899',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      profile: {
        create: {
          bio: 'Chilonzor va Yunusobod bo‘yicha ixtisoslashgan makler. Talabalar va yosh oilalar uchun qulay narxdagi xonadonlarni tez va halol topib beraman.',
          experienceYears: 4,
          companyName: 'Oila Makler UZ',
          specialization: 'Arzon va qulay kvartiralar, hovlilar',
          telegram: '@rustam_ijara',
          ratingAvg: 4.8,
          totalDeals: 84,
          responseTimeMin: 15
        }
      },
      verification: {
        create: {
          status: 'VERIFIED',
          documentNumber: 'AB9876543',
          verifiedAt: new Date()
        }
      }
    }
  });

  // Client User (Jasurbek Aliyev)
  const clientUser = await prisma.user.create({
    data: {
      email: 'client@ijara.uz',
      passwordHash,
      role: 'CLIENT',
      firstName: 'Jasurbek',
      lastName: 'Aliyev',
      phone: '+998991112233',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      isVerified: true
    }
  });

  // 5. Sample Properties
  const propertiesData = [
    {
      title: 'Chilonzorda shinam va to‘liq jihozlangan 2 xonali kvartira',
      description: 'Chilonzor 1-mavzesida metro bekatiga 5 daqiqalik masofada joylashgan shinam xonadon. Yangi ta’mirlangan, barcha maishiy texnikalar (kir yuvish mashinasi, konditsioner, muzlatkich) mavjud. Tinch va osoyishta hovli, keng avtoturargoh.',
      price: 4500000,
      currency: 'UZS',
      rentPeriod: 'MONTHLY',
      propertyType: 'APARTMENT',
      rooms: 2,
      area: 62.0,
      floor: 3,
      totalFloors: 5,
      furnished: true,
      address: 'Chilonzor tumani, 1-mavze, 14-uy',
      regionId: regionMap['Toshkent shahri'],
      districtId: districtMap['Chilonzor tumani'],
      mahallaId: mahallaMap['Chilonzor tumani_1-mavze'],
      latitude: 41.2785,
      longitude: 69.2089,
      status: 'APPROVED',
      views: 342,
      rating: 4.9,
      brokerId: broker1.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80', isPrimary: false }
      ],
      amenities: ['Wi-Fi Internet', 'Konditsioner', 'Muzlatkich', 'Kir yuvish mashinasi', 'Televizor Smart TV', 'Avtoturargoh']
    },
    {
      title: 'Yunusobod Shahristonda lyuks 3 xonali yangi bino kvartirasi',
      description: 'Shahriston metrosiga juda yaqin, novostroyka binosida joylashgan zamonaviy kvartira. Dizaynerlik yevro-ta’miri, keng oshxona, 2 ta sanuzel, xavfsizlik 24/7. Oila yoki xorijlik mehmonlar uchun ideal tanlov.',
      price: 8500000,
      currency: 'UZS',
      rentPeriod: 'MONTHLY',
      propertyType: 'APARTMENT',
      rooms: 3,
      area: 98.0,
      floor: 7,
      totalFloors: 12,
      furnished: true,
      address: 'Yunusobod tumani, Amir Temur ko‘chasi, 88A',
      regionId: regionMap['Toshkent shahri'],
      districtId: districtMap['Yunusobod tumani'],
      mahallaId: mahallaMap['Yunusobod tumani_Shahriston'],
      latitude: 41.3524,
      longitude: 69.2872,
      status: 'APPROVED',
      views: 618,
      rating: 5.0,
      brokerId: broker1.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80', isPrimary: false },
        { url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80', isPrimary: false }
      ],
      amenities: ['Wi-Fi Internet', 'Konditsioner', 'Muzlatkich', 'Kir yuvish mashinasi', 'Zamonaviy lift', '24/7 Qo‘riqlash tizimi', 'Avtoturargoh', 'Balkon / Terassa']
    },
    {
      title: 'Mirzo Ulug‘bekda Buyuk Ipak Yo‘lida 1 xonali ixcham kvartira',
      description: 'Yolg‘iz yashovchi mutaxassis yoki yosh juftlik uchun ideal. Yangi mebel va texnika bilan to‘liq jihozlangan. Metroga 3 daqiqa piyoda. Atrofida supermarketlar, kafelar va park mavjud.',
      price: 3800000,
      currency: 'UZS',
      rentPeriod: 'MONTHLY',
      propertyType: 'APARTMENT',
      rooms: 1,
      area: 44.0,
      floor: 4,
      totalFloors: 9,
      furnished: true,
      address: 'Mirzo Ulug‘bek tumani, Mirzo Ulug‘bek shoh ko‘chasi, 21',
      regionId: regionMap['Toshkent shahri'],
      districtId: districtMap['Mirzo Ulug‘bek tumani'],
      mahallaId: mahallaMap['Mirzo Ulug‘bek tumani_Buyuk Ipak Yo‘li'],
      latitude: 41.3267,
      longitude: 69.3245,
      status: 'APPROVED',
      views: 289,
      rating: 4.8,
      brokerId: broker2.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80', isPrimary: false }
      ],
      amenities: ['Wi-Fi Internet', 'Konditsioner', 'Muzlatkich', 'Kir yuvish mashinasi', 'Zamonaviy lift']
    },
    {
      title: 'Yakkasaroy Rakat mahallasida 4 xonali premium hovli uy',
      description: 'Toshkent markazida hashamatli hovli uy. 4 ta keng yotoqxona, 3 ta vanna xonasi, yashil bog‘, suzish havzasi va yopiq garaj. Diplomatlar va elita oilalar uchun tayyor.',
      price: 22000000,
      currency: 'UZS',
      rentPeriod: 'MONTHLY',
      propertyType: 'HOUSE',
      rooms: 4,
      area: 280.0,
      floor: 2,
      totalFloors: 2,
      furnished: true,
      address: 'Yakkasaroy tumani, Rakatboshi ko‘chasi, 45',
      regionId: regionMap['Toshkent shahri'],
      districtId: districtMap['Yakkasaroy tumani'],
      mahallaId: mahallaMap['Yakkasaroy tumani_Rakat'],
      latitude: 41.2956,
      longitude: 69.2534,
      status: 'APPROVED',
      views: 740,
      rating: 5.0,
      brokerId: broker1.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80', isPrimary: false }
      ],
      amenities: ['Wi-Fi Internet', 'Konditsioner', 'Muzlatkich', 'Kir yuvish mashinasi', 'Avtoturargoh', '24/7 Qo‘riqlash tizimi', 'Balkon / Terassa']
    },
    {
      title: 'Samarqand markazida Registon yaqinida 2 xonali kvartira',
      description: 'Samarqand shahrining tarixiy markazida shinam kvartira. Sayyohlar, oilalar va xizmat safari bilan kelganlar uchun qulay sharoitlar. Toza, barcha qulayliklar bor.',
      price: 4000000,
      currency: 'UZS',
      rentPeriod: 'MONTHLY',
      propertyType: 'APARTMENT',
      rooms: 2,
      area: 58.0,
      floor: 2,
      totalFloors: 4,
      furnished: true,
      address: 'Samarqand shahri, Registon ko‘chasi, 12',
      regionId: regionMap['Samarqand viloyati'],
      districtId: districtMap['Samarqand shahri'],
      mahallaId: mahallaMap['Samarqand shahri_Registon'],
      latitude: 39.6542,
      longitude: 66.9758,
      status: 'APPROVED',
      views: 195,
      rating: 4.85,
      brokerId: broker2.id,
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-ae1b466320f2?auto=format&fit=crop&w=1200&q=80', isPrimary: true }
      ],
      amenities: ['Wi-Fi Internet', 'Konditsioner', 'Muzlatkich', 'Kir yuvish mashinasi']
    }
  ];

  const createdProperties = [];
  for (const prop of propertiesData) {
    const { images, amenities, ...rest } = prop;
    const created = await prisma.property.create({
      data: {
        ...rest,
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            order: idx
          }))
        },
        amenities: {
          create: amenities.map((name) => ({
            amenityId: amenityMap[name]
          }))
        }
      }
    });
    createdProperties.push(created);
  }

  // 6. Favorites
  await prisma.favorite.create({
    data: {
      userId: clientUser.id,
      propertyId: createdProperties[0].id
    }
  });

  // 7. Viewing Booking
  await prisma.viewing.create({
    data: {
      propertyId: createdProperties[0].id,
      clientId: clientUser.id,
      brokerId: broker1.id,
      scheduledTime: new Date(Date.now() + 24 * 3600 * 1000 * 2), // 2 days later
      notes: 'Shanba kuni soat 15:00 da oilamiz bilan ko‘rishni xohlaymiz.',
      status: 'CONFIRMED'
    }
  });

  // 8. Sample Contract & Handover Act
  const contract = await prisma.contract.create({
    data: {
      contractNumber: 'IJARA-2026-0042',
      landlordName: 'Aziz Mahmudov',
      landlordPhone: '+998909876543',
      tenantId: clientUser.id,
      brokerId: broker1.id,
      propertyId: createdProperties[0].id,
      regionName: 'Toshkent shahri',
      districtName: 'Chilonzor tumani',
      mahallaName: '1-mavze',
      address: 'Chilonzor tumani, 1-mavze, 14-uy, 28-xonadon',
      startDate: new Date('2026-11-01'),
      endDate: new Date('2027-10-31'),
      rentAmount: 4500000,
      paymentDate: 5,
      depositAmount: 4500000,
      utilitiesIncluded: 'Sovuq suv, chiqindi, domkom xarajatlari',
      furnitureList: 'Divan, 2 ta kreslo, shkaf, oshxona garnituri, 2 kishilik krovat',
      additionalTerms: 'Uyda chekish va uy hayvonlari boqish egasining roziligi bilan.',
      status: 'ACTIVE',
      tenantApproved: true,
      brokerApproved: true
    }
  });

  await prisma.handoverAct.create({
    data: {
      contractId: contract.id,
      meterGas: '14320.5 m³',
      meterElectricity: '08942.0 kW',
      meterWater: '03211.2 m³',
      propertyCondition: 'A’lo holatda, yangi ta’mir, devorlar toza, santexnika soz.',
      furnitureNotes: 'Barcha jihozlar ro‘yxat bo‘yicha butun va ishchi holatda qabul qilindi.',
      tenantApproved: true,
      brokerApproved: true,
      signedDate: new Date('2026-11-01')
    }
  });

  // 9. Conversation & Messages
  const convo = await prisma.conversation.create({
    data: {
      clientId: clientUser.id,
      brokerId: broker1.id,
      propertyId: createdProperties[0].id
    }
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: convo.id,
        senderId: clientUser.id,
        text: 'Assalomu alaykum, Dilfuza opa! Chilonzordagi 2 xonali kvartira bo‘yicha murojaat qilayotgandim.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600 * 1000 * 5)
      },
      {
        conversationId: convo.id,
        senderId: broker1.id,
        text: 'Vaalaykum assalom, Jasur aka! Ha, kvartira bo‘sh, istagan paytingiz borib ko‘rsak bo‘ladi.',
        isRead: true,
        createdAt: new Date(Date.now() - 3600 * 1000 * 4)
      },
      {
        conversationId: convo.id,
        senderId: clientUser.id,
        text: 'Ajoyib! Ko‘rish so‘rovini yubordim, shanba kuni 15:00 ma’qul keladimi?',
        isRead: false,
        createdAt: new Date(Date.now() - 3600 * 1000 * 2)
      }
    ]
  });

  // 10. Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: clientUser.id,
        title: 'Uchrashuv tasdiqlandi',
        message: 'Chilonzordagi 2 xonali kvartira bo‘yicha ko‘rish so‘rovingiz tasdiqlandi.',
        type: 'BOOKING',
        isRead: false
      },
      {
        userId: clientUser.id,
        title: 'Shartnoma tayyor',
        message: 'IJARA-2026-0042 raqamli ijara shartnomasi va topshirish dalolatnomasi tasdiqlash uchun kutmoqda.',
        type: 'CONTRACT',
        isRead: true
      },
      {
        userId: broker1.id,
        title: 'Yangi ko‘rish so‘rovi',
        message: 'Jasurbek Aliyev Chilonzordagi kvartirani ko‘rish uchun so‘rov yubordi.',
        type: 'BOOKING',
        isRead: true
      }
    ]
  });

  // 11. Review
  await prisma.review.create({
    data: {
      authorId: clientUser.id,
      targetUserId: broker1.id,
      propertyId: createdProperties[0].id,
      rating: 5,
      comment: 'Dilfuza opaga katta rahmat! Kvartirani juda tez va barcha rasmiy hujjatlari bilan tayyorlab berishdi. Tavsiya qilaman!',
      roleScope: 'BROKER'
    }
  });

  console.log('✅ Seeding completed successfully!');
  console.log('Accounts:');
  console.log('Admin:  admin@ijara.uz / admin123');
  console.log('Broker: dnasriddinova087@gmail.com / ijara123');
  console.log('Broker 2: rustam@ijara.uz / ijara123');
  console.log('Client: client@ijara.uz / ijara123');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
